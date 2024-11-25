const express = require("express");
const sessionsmodel = require("../models/sessionsmodel");
const Note = require("../models/notesmodel");
const authenticateToken = require("../middlewares/jwtguard");
notesRouter = express.Router();



//METHOD:POST
//ROUTE FOR COUNSELOR TO ADD NOTES FOR THE PARTICULAR SESSION

notesRouter.post("/add/:sessionId", authenticateToken, async (req, res) => {
  const { sessionId } = req.params;
  const { notes } = req.body;

  const counselorId = req.user.id;

  try {
    const session = await sessionsmodel.findById(sessionId);
    const clientId = session.client;

    if (!sessionId) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    const newNote = new Note({
      sessionId,
      counselorId,
      clientId,
      notes,
    });

    await newNote.save();

    return res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: newNote,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add note",
      error: error.message,
    });
  }
});



//METHOD:GET
//ROUTE FOR CLIENT TO VIEW NOTES ADDED BY COUNSELOR FOR A PARTICULAR SESSION

notesRouter.get("/:sessionId", authenticateToken, async (req, res) => {
  const { sessionId } = req.params;

  try {
    const notes = await Note.find({ sessionId })
      .populate("counselorId", "name")
      .sort({ createdAt: -1 });

    if (!notes.length) {
      return res
        .status(404)
        .json({ success: false, message: "No notes found for this session" });
    }

    return res.status(200).json({ success: true, data: notes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
      error: error.message,
    });
  }
});



//METHOD:GET
//ROUTE FOR CLIENT TO VIEW ALL NOTES ADDED BY COUNSELOR FOR ALL SESSIONS

notesRouter.get("/client/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.user;

    if (role !== "client") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    const notes = await Note.find({ clientId: userId })
      .populate("sessionId") // Populate session details
      .populate("counselorId", "name email"); // Populate counselor details
    console.log(notes);
    if (!notes.length) {
      return res
        .status(404)
        .json({ success: false, message: "No notes found for this client" });
    }

    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching notes",
      error:error.message
    });
  }
});

module.exports = {
  notesRouter,
};
