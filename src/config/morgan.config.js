const appRoot = require("app-root-path");
const fs = require("fs");

const filepath = `${appRoot}/log/`;

const logStandard = fs.createWriteStream(`${filepath}parttracker.log`, {
  flags: "a",
});

const prismaLogStandard = fs.createWriteStream(`${filepath}prismaError.log`, {
  flags: "a",
});

const multerLogStandard = fs.createWriteStream(`${filepath}multerError.log`, {
  flags: "a",
});

const logs = {
  logStandard: logStandard,
  prismaLogStandard: prismaLogStandard,
  multerLogStandard: multerLogStandard
};

module.exports = logs;
