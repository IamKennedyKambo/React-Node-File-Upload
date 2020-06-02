let express = require("express"),
  multer = require("multer"),
  mongoose = require("mongoose"),
  router = express.Router();

const { v4: uuidv4 } = require("uuid");

const DIR = "./public/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

// Gallery model
let gallerySchema = require("../models/Gallery");

router.post(
  "/upload-images",
  upload.array("imgCollection", 8),
  (req, res, next) => {
    const reqFiles = [];
    const url = req.protocol + "://" + req.get("host");
    for (var i = 0; i < req.files.length; i++) {
      reqFiles.push(url + "/public/" + req.files[i].filename);
    }

    const user = new gallerySchema({
      _id: new mongoose.Types.ObjectId(),
      imgCollection: reqFiles,
    });

    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "Done uploading!",
          userCreated: {
            _id: result._id,
            imgCollection: result.imgCollection,
          },
        });
      })
      .catch((err) => {
        console.log(err),
          res.status(500).json({
            error: err,
          });
      });
  }
);

module.exports = router;
