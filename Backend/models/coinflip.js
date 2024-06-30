const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const coinflipSchema = new Schema({
  ownerCoin: { type: String, required: true },
  playerOne: {
    username: { type: String, required: true },
    robloxId: { type: String, required: true },
    thumbnail: { type: String, required: true },
    level: { type: Number, required: true },
    items: { type: Array, required: true },
  },
  playerTwo: {
    username: { type: String },
    robloxId: { type: String },
    thumbnail: { type: String },
    level: { type: Number },
    items: { type: Array },
  },
  value: { type: Number, required: true },
  requirements: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  winnerCoin: { type: String },
  winner: { type: String },
  serverSeed: { type: String, required: true },
  hashedServerSeed: { type: String, required: true },
  clientSeed: { type: String },
  EOSBlock: { type: String },
  createdAt: { type: Date, required: true },
  endedAt: { type: Date },
  result: { type: Number },
  inactive: { type: Boolean, index: true },
  game: { type: String, required: true },
});

module.exports = mongoose.model("Coinflip", coinflipSchema);
