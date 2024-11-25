const mongoose = require("mongoose")


const availabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true }, // Specific date
  times: { type: [String], required: true }, // Array of time slots
});



//USERSCHEMA CREATION

const Userschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["client", "counselor"],
    required: true,
  },
  availability:  [availabilitySchema],
  history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session", // Store references to booked sessions
    },
  ],
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("users", Userschema)
