const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gallerySchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    imgCollection: {
      type: Array,
    },
  },
  {
    collection: "images",
  }
);

module.exports = mongoose.model("Gallery", gallerySchema);
