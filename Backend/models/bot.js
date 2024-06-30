const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const botSchema = new Schema({
  robloxId: { type: String, required: true },
  username: { type: String, required: true },
  thumbnail: { type: String, required: true },
  privateServer: { type: String, required: true },
  status: { type: String, required: true },
  game: { type: String, required: true, index: true },
});

module.exports = mongoose.model("Bot", botSchema);
