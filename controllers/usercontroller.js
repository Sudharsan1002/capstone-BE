const express = require("express")
const authenticateToken = require("../middlewares/jwtguard")
const usermodel = require("../models/usermodel")
const Session = require("../models/sessionsmodel")
const userRouter = express.Router()


//METHOD:GET
//ROUTE TO GET  ALL COUNSELOR FROM USERMODEL

userRouter.get("/counselors", authenticateToken, async (req, res) => {
    try {
        const counselors = await usermodel.find({ role: "counselor" }, "name email")
    return res.status(200).json({ counselors })
    } catch (error) {
        console.error("Error fetching counselors:", error.message)
        return res.status(500).json({message:"Failed to fetch counselor"})
    }
    
})


//METHOD:GET
// Fetch clients who booked sessions with a particular counselor
userRouter.get('/clients/:counselorId', authenticateToken, async (req, res) => {
  const { counselorId } = req.params;

  try {
    // Find sessions associated with the given counselor
    const sessions = await Session.find({ counselor: counselorId }).populate('client');

    // Extract unique client IDs from sessions
    const clientIds = [...new Set(sessions.map((session) => session.client._id.toString()))];

    // Fetch clients based on the extracted IDs
    const clients = await usermodel.find({ _id: { $in: clientIds } });

    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch clients', error: error.message });
  }
});


module.exports=userRouter