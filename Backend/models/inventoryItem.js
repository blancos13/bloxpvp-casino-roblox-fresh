const mongoose = require('mongoose')
const Schema = mongoose.Schema

const inventorySchema = new Schema ({
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    locked: { type: Boolean, required: true },
    game: { type: 'String', required: true }
}) 

module.exports = mongoose.model("InventoryItem", inventorySchema)