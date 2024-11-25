const mongoose = require("mongoose"); 
const usermodel = require("./usermodel");

const SessionSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  sessionTime: {
    type: Date,
    required: true,
  },
  sessionType: {
    type: String,
    enum: ["mentalHealth", "careerCounseling", "relationshipAdvice"], // Session categories
    required: true,
  },
  status: {
    type: String,
    enum: ["booked", "completed", "cancelled"],
    default: "booked",
    },
    meetingLink: {
        type: String,
        required:false
    },
    meetingId: {
        type: String,
        required:false
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        required:false
    },
    expiresAt: {
        type: Date,
        required:true
    },
  createdAt: { type: Date, default: Date.now },
});

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports=mongoose.model("session",SessionSchema)