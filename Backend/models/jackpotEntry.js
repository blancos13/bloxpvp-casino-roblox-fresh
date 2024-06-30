const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jackpotEntrySchema = new Schema({
  joiner: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  joinerRobloxId: { type: String, required: true },
  value: { type: Number, required: true },
  items: { type: Array, required: true },
  jackpotGame: {
    type: Schema.Types.ObjectId,
    ref: "Jackpot",
    required: true,
    index: true,
  },
  username: { type: String, required: true },
  thumbnail: { type: String, required: true },
});

module.exports = mongoose.model("JackpotEntry", jackpotEntrySchema);
