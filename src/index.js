const express = require("express");

const cors = require("cors");
const app = express();

const prismaClient = require("./prisma/client");
const prismaErrorHandler = require("./middleware/prismaErrorHandler");

// Defining routes
const partRouter = require("./routes/part.route");
const categoryRouter = require("./routes/category.route");

// Error logging
const morgan = require("morgan");
const logs = require("./config/morgan.config");

app.use(morgan("combined", { stream: logs.logStandard }));

app.use(express.json());
app.use(cors());

app.use("/api", partRouter, categoryRouter);

// Error handling middleware
app.use(prismaErrorHandler);

// Starts the server on EITHER the port listed in .env or 4000
app.listen(process.env.PORT || "4000", () => {
  console.log(`Server is running on port: ${process.env.PORT || "4000"}`);
});
