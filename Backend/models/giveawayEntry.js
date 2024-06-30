const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const giveawayEntrySchema = new Schema({
  joiner: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  robloxId: { type: String, required: true },
  giveaway: { type: Schema.Types.ObjectId, ref: "Giveaway", required: true },
});

module.exports = mongoose.model("GiveawayEntry", giveawayEntrySchema);
