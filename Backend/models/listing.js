const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: "InventoryItem", required: true },
  poster: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  game: { type: String },
  posterUsername: { type: String, required: true },
  rate: { type: Number, required: true },
  status: { type: String, required: true },
});

module.exports = mongoose.model("Listing", listingSchema);
