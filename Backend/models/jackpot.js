const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jackpotSchema = new Schema({
  value: { type: Number, required: true },
  requirements: {
    max: { type: Number },
  },
  winner: { type: Schema.Types.ObjectId },
  serverSeed: { type: String, required: true },
  hashedServerSeed: { type: String, required: true },
  clientSeed: { type: String },
  EOSBlock: { type: String },
  endsAt: { type: Date },
  result: { type: Number },
  inactive: { type: Boolean, index: true },
  state: { type: String, required: true },
  game: { type: String },
});

module.exports = mongoose.model("Jackpot", jackpotSchema);
