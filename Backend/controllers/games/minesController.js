const MinesGame = require("./mines");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const { validationResult, query } = require("express-validator");
const mongoose = require("mongoose");
const Account = require("../../models/account");
const { XP_CONSTANT } = require("../../config");

const minesGame = new MinesGame();

exports.handleMinesCreateGame = [
  query("betAmount")
    .trim()
    .isNumeric()
    .toFloat()
    .isFloat({ min: 0.01 })
    .escape(),
  query("mineCount").trim().isNumeric().toInt().isInt({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await session.abortTransaction();
        return res.status(400).json({ errors: errors.array() });
      }

      const { betAmount, mineCount } = req.query;
      const userId = req.user.id;

      let user = await Account.findById(userId).session(session);

      const hasInProgressGame =
        user.minesHistory &&
        user.minesHistory.some((game) => game.status === "in-progress");
      if (hasInProgressGame) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({
            error: "Cannot start a new game while there is an ongoing game",
          });
      }

      if (user.balance < parseFloat(betAmount)) {
        await session.abortTransaction();
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const clientSeed = user.clientSeed;
      const nonce = user.minesNonce;
      const gameId = uuidv4();

      const result = minesGame.createBoard(
        clientSeed,
        user.minesServerSeed,
        nonce,
        parseFloat(betAmount),
        parseInt(mineCount),
      );
      const gridWithRevealed = result.grid.map((row) =>
        row.map((cell) => ({ type: cell, revealed: false })),
      );

      user.minesHistory.push({
        gameId,
        betAmount: parseFloat(betAmount),
        mineCount: parseInt(mineCount),
        status: "in-progress",
        grid: gridWithRevealed,
      });
      user.totalWagered += parseFloat(betAmount);
      user.level = Math.floor(
        XP_CONSTANT * user.totalWagered + parseFloat(betAmount),
      );
      user.minesInProgress = true;
      user.minesGameId = gameId;
      user.minesGameState = {
        grid: result.grid.filter((row) => row.every((cell) => cell !== "mine")),
        betAmount: parseFloat(betAmount),
        status: "in-progress",
      };

      user.minesNonce++;

      await user.save({ session });
      await session.commitTransaction();

      const gameState = {
        gameId,
        grid: result.grid.map((row) =>
          row.map((cell) => (cell.revealed ? cell.type : "hidden")),
        ),
        betAmount: parseFloat(betAmount),
        status: "in-progress",
      };

      res.status(200).json({ gameState });
    } catch (error) {
      await session.abortTransaction();
      console.error("Error creating Mines game:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      session.endSession();
    }
  }),
];
