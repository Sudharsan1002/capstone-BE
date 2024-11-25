const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

const MONGODBURI = process.env.MONGODB_URI

if (!MONGODBURI) {
    console.log("MONGODB URI NOT DEFINED")
    process.exit(1)
} else {
    console.log("Connecting to MONGODBURI", MONGODBURI)
}


// FUNCTION TO CREATE DATABASE CONNECTIVITY

async function createDbConnection() {
    try {
        const response = await mongoose.connect(MONGODBURI)
        console.log("Connection Established")
        
    } catch (error) {
        console.log("Failed",error.message)
    }
}



module.exports = {
    createDbConnection
}

