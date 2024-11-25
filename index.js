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


//CREATING A SERVER
const API_SERVER = express();

//FUNCTION TO CREATE CONNECTION WITH DATABASE
createDbConnection();

//USING CORS TO INTEGRATION
API_SERVER.use(cors());


//USI9NG BODY PARSER TO PARSE INCOMING REQUEST FROM BODY
API_SERVER.use(bodyParser.json());

// INJECTING ROUTES
API_SERVER.use("/auth", authrouter);
API_SERVER.use("/availability", availrouter);
API_SERVER.use("/users", userRouter);
API_SERVER.use("/sessions", sessionRouter);
API_SERVER.use("/payments", paymentRouter);
API_SERVER.use("/notes", notesRouter);


//STARTING AND LISTENING TO SERVER
API_SERVER.listen(process.env.PORT, process.env.HOSTNAME, () => {
    console.log(`http//:${process.env.HOSTNAME}:${process.env.PORT}`)
  console.log("Server started");
});
