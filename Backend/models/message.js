const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  thumbnail: { type: String, required: true },
  username: { type: String, required: true },
  robloxId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  message: { type: String, required: true },
  rank: { type: String, required: true },
});

module.exports = mongoose.model("Message", chatSchema);
