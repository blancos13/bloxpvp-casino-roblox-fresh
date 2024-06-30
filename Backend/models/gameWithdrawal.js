const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gameWithdrawalSchema = new Schema({
  inventoryItem: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  item_name: { type: String, required: true },
  robloxId: { type: String, required: true },
  game: { type: String, required: true },
});

module.exports = mongoose.model("GameWithdrawal", gameWithdrawalSchema);
