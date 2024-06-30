const asyncHandler = require("express-async-handler");
const Bot = require("../../models/bot");
const mongoose = require("mongoose");

exports.get_bots_mm2 = asyncHandler(async (req, res, next) => {
  const bots = await Bot.find({ game: "MM2" });
  res.status(200).send(bots);
});

exports.get_bots_ps99 = asyncHandler(async (req, res, next) => {
  const bots = await Bot.find({ game: "PS99" });
  res.status(200).send(bots);
});
