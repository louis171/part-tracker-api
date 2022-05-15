const express = require("express");
const multer = require("multer");
const appRoot = require("app-root-path");
const fs = require("fs");
const path = require("path");
const DIR = "./public/";

const partRouter = express.Router();

const prismaClient = require("../prisma/client");
const { nanoid } = require('nanoid');

// READ all parts
partRouter.get("/parts", async (req, res, next) => {
  await prismaClient.part
    .findMany({
      include: {
        category: {
          select: {
            categoryName: true,
          },
        },
      },
    })
    .then((part) => {
      res.status(200).json(part);
    })
    .catch((err) => next(err)); // passing error to middleware
});

// READ parts by category
partRouter.get("/parts/category:partCategoryId?", async (req, res, next) => {
  await prismaClient.part
    .findMany({
      where: {
        partCategoryId: parseInt(req.query.partCategoryId),
      },
      include: {
        category: {
          select: {
            categoryName: true,
          },
        },
      },
    })
    .then((part) => {
      res.status(200).json(part);
    })
    .catch((err) => next(err)); // passing error to middleware
});

// CREATE new part
partRouter.post("/parts/create", async (req, res, next) => {
  await prismaClient.part
    .create({
      data: {
        partManufacturer: req.body.partManufacturer,
        partModel: req.body.partModel,
        partQuantity: parseInt(req.body.partQuantity),
        partCategoryId: req.body.partCategoryId,
      },
    })
    .then((part) => {
      res.status(201).json({ message: "Success", part: part });
    })
    .catch((err) => next(err)); // passing error to middleware
});

// UPDATE part by partId
partRouter.put("/parts/update:partId?", async (req, res, next) => {
  await prismaClient.part
    .update({
      where: {
        partId: parseInt(req.query.partId),
      },
      data: {
        partManufacturer: req.body.partManufacturer,
        partModel: req.body.partModel,
        partQuantity: req.body.partQuantity,
        partCategoryId: req.body.partCategoryId,
      },
    })
    .then((part) => {
      res.status(200).json({
        message: `Updated part with ID ${req.query.partId}`,
        part: part,
      });
    })
    .catch((err) => next(err)); // passing error to middleware
});

// DELETE part by partId
partRouter.delete("/parts/delete:partId?", async (req, res, next) => {
  await prismaClient.part
    .delete({
      where: {
        partId: parseInt(req.query.partId),
      },
    })
    .then(
      res
        .status(200)
        .json({ message: `Delete part with ID ${req.query.partId}` })
    )
    .catch((err) => next(err)); // passing error to middleware
});

const uploadOLD = multer({
  dest: `${appRoot}/temp/`,
  limits: {
    files: 1,
  },
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const rng = nanoid(24);
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, rng + "-" + fileName);
  },
});

const handleUpload = multer({
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
}).single("partImageUpload");

partRouter.post(
  "/2upload",
  uploadOLD.single(
    "partImageUpload"
  ),
  (req, res, next) => {
    console.log(req.file);
    console.log(req.file.path);


  }
);

partRouter.post(
  "/upload2:partId?",
  handleUpload, 
  (req, res, next) => {
    prismaClient.image.create({
      data: {
        partId: req.query.partId
      }
    }).then((image) => {
      res.status(201).json({ message: "Success", image: image });
    })
    .catch((err) => next(err)); // passing error to middleware
  }
);

module.exports = partRouter;