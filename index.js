const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const { createDbConnection } = require("./db");
const bodyParser = require("body-parser");
const authrouter = require("./controllers/authcontroller");
const availrouter = require("./controllers/availabilitycontroller");
const userRouter = require("./controllers/usercontroller");
const sessionRouter = require("./controllers/sessionscontroller");
const paymentRouter = require("./controllers/paymentcontroller");
const { notesRouter } = require("./controllers/notescontroller");

const API_SERVER = express();

createDbConnection();
API_SERVER.use(cors());

API_SERVER.use(bodyParser.json());

// INJECTING ROUTES
API_SERVER.use("/auth", authrouter);
API_SERVER.use("/availability", availrouter);
API_SERVER.use("/users", userRouter);
API_SERVER.use("/sessions", sessionRouter);
API_SERVER.use("/payments", paymentRouter);
API_SERVER.use("/notes", notesRouter);

API_SERVER.listen(process.env.PORT, process.env.HOSTNAME, () => {
    console.log(`http//:${process.env.HOSTNAME}:${process.env.PORT}`)
  console.log("Server started");
});
