const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connectRobloxSchema = new Schema({
  robloxId: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("ConnectRoblox", connectRobloxSchema);
