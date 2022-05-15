const express = require("express");

const categoryRouter = express.Router();

const prismaClient = require("../prisma/client");

categoryRouter.get("/categories", async (req, res, next) => {
  await prismaClient.category
    .findMany()
    .then((category) => {
      res.status(200).json(category);
    })
    .catch((err) => next(err)); // passing error to middleware
});



module.exports = categoryRouter;