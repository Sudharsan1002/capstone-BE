const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "session", // Refers to the Session model
      required: true,
    },
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // Refers to the User model (counselor)
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // Refers to the User model (client)
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create an index on sessionId for quick lookups of notes related to a specific session
noteSchema.index({ sessionId: 1 });

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
