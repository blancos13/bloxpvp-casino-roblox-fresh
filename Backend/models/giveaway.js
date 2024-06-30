const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const giveawaySchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: "InventoryItem", required: true },
  host: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  winner: { type: Schema.Types.ObjectId },
  game: { type: String, required: true },
  winnerName: { type: String },
  winnerImage: { type: String },
  endsAt: { type: Date },
  inactive: { type: Boolean },
});

module.exports = mongoose.model("Giveaway", giveawaySchema);
