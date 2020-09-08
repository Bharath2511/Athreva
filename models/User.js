const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  trip: { type: Array, default: [] },

  date: {
    type: String,
    default: Date.now
  },
  count: { type: Number, default: 0 }
});

module.exports = User = mongoose.model("users", userSchema);
