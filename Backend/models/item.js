const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  item_id: { type: Number },
  item_name: { type: String, unique: true },
  display_name: { type: String },
  item_value: { type: String },
  item_image: { type: String },
  game: { type: String },
});

module.exports = mongoose.model("Item", itemSchema);
