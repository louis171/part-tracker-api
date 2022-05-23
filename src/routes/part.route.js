const express = require("express");
const multer = require("multer");
const appRoot = require("app-root-path");
const fs = require("fs");
const path = require("path");
const DIR = "./public/";

const partRouter = express.Router();

const prismaClient = require("../prisma/client");
const { nanoid } = require("nanoid");

// Handles destination and building filename
// Filename: rng string from nanoid concat original filename with spaces replaced with hyphens
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

// Handles save to disk
// Checks for file type and returns error if the incorrect filetype
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
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
}).single("partImageUpload");

// Handles destination and building filename
// Filename: rng string from nanoid concat original filename with spaces replaced with hyphens
const storageUpdate = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const rng = nanoid(24);
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, rng + "-" + fileName);
  },
});

// Handles save to disk
// Checks for file type and returns error if the incorrect filetype
const handleUpdate = multer({
  storage: storageUpdate,
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
}).single("partImageUpdate");

const noUpload = multer().none();

// READ all parts
partRouter.get("/parts", async (req, res, next) => {
  await prismaClient.part
    .findMany({
      include: {
        category: {
          select: {
            categoryName: true,
            categoryId: true,
          },
        },
        image: {
          select: {
            imagePath: true,
            imageId: true
          },
        },
      },
    })
    .then((part) => {
      res.status(200).json(part);
    })
    .catch((err) => next(err)); // passing error to middleware
});

// READ all parts RELEASED DATES
partRouter.get("/parts/released", async (req, res, next) => {
  await prismaClient.part
    .findMany({
      select: {
        partId: true,
        partReleased: true,
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
partRouter.post("/parts/create", handleUpload, (req, res, next) => {
  const partId = nanoid(16);
  const imageId = nanoid(16);
  const url = req.protocol + "://" + req.get("host") + "/public";
  const path = url + "/" + req.file.path.split("\\")[1];
  prismaClient.part
    .create({
      data: {
        partId: partId,
        partManufacturer: req.body.partManufacturer,
        partModel: req.body.partModel,
        partReleased: req.body.partReleased,
        partQuantity: parseInt(req.body.partQuantity),
        partCategoryId: parseInt(req.body.partCategoryId),
        partLink: req.body.partLink,
        image: {
          create: {
            imageId: imageId,
            imagePath: path,
          },
        },
      },
    })
    .then((part) => {
      res.status(201).json({ message: "Success", part: part });
    })
    .catch((err) => next(err)); // passing error to middleware
});

// UPDATE part by partId
partRouter.put("/parts/update:partId?", noUpload, async (req, res, next) => {
  await prismaClient.part
    .update({
      where: {
        partId: req.query.partId,
      },
      data: {
        partManufacturer: req.body.partManufacturer,
        partModel: req.body.partModel,
        partReleased: req.body.partReleased,
        partQuantity: parseInt(req.body.partQuantity),
        partCategoryId: parseInt(req.body.partCategoryId),
        partLink: req.body.partLink,
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

// Update image by imageId
partRouter.put(
  "/parts/image/update:imageId?",
  handleUpdate,
  async (req, res, next) => {
    const url = req.protocol + "://" + req.get("host") + "/public";
    const path = url + "/" + req.file.path.split("\\")[1];
    await prismaClient.image
      .update({
        where: {
          imageId: req.query.imageId,
        },
        data: {
          imagePath: path,
        },
      })
      .then((part) => {
        res.status(200).json({
          message: `Updated image with ID ${req.query.imageId}`,
          part: part,
        });
      })
      .catch((err) => next(err)); // passing error to middleware
  }
);

// DELETE part by partId
partRouter.delete("/parts/delete:partId?", async (req, res, next) => {
  await prismaClient.part
    .delete({
      where: {
        partId: req.query.partId,
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

module.exports = partRouter;
