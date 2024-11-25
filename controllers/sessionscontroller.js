const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const usermodel = require("../models/usermodel");
const authenticateToken = require("../middlewares/jwtguard");
const Session = require("../models/sessionsmodel");
const sessionRouter = express.Router();
const mongoose = require("mongoose");
const { createZoomMeeting } = require("../utils/zoom.utils");
const { captureOrder } = require("../utils/paypal.utils");
const HOSTMAIL = process.env.ZOOM_HOST;

sessionRouter.post("/booksessions", authenticateToken, async (req, res) => {
  const { counselorId, sessionTime, sessionType, orderId, price } = req.body;
  const clientId = req.user.id;

  if (!mongoose.isValidObjectId(counselorId)) {
    return res.status(400).json({ message: "Invalid counselor ID format." });
  }

  if (!mongoose.isValidObjectId(clientId)) {
    return res.status(400).json({ message: "Invalid client ID format." });
  }

  try {
    const formattedSessionTime = new Date(sessionTime);
    if (isNaN(formattedSessionTime.getTime())) {
      return res.status(400).json({ message: "Invalid sessionTime format." });
    }

    const utcSessionTime = new Date(formattedSessionTime.toISOString());
    const timeStr = utcSessionTime
      .toISOString()
      .split("T")[1]
      .split(".")[0]
      .slice(0, 5); // e.g., "10:00"
    const dateStr = utcSessionTime.toISOString().split("T")[0]; // e.g., "2024-11-22"

    const counselor = await usermodel.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found." });
    }

    const client = await usermodel.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    const counselorAvailability = counselor.availability.find(
      (availability) =>
        availability.date.toISOString().split("T")[0] === dateStr
    );

    if (!counselorAvailability) {
      return res
        .status(400)
        .json({ message: "Counselor is not available on this date." });
    }

    console.log("Counselor's available times:", counselorAvailability.times);

    const selectedTimeRange = counselorAvailability.times.find((timeRange) => {
      const [startTime, endTime] = timeRange.split("-");
      const start = startTime.trim();
      const end = endTime.trim();

      // Check if the selected time falls within the range
      return timeStr >= start && timeStr < end;
    });

    if (!selectedTimeRange) {
      return res
        .status(400)
        .json({ message: "Selected time slot is not available." });
    }

    const zoomMeeting = await createZoomMeeting(
      HOSTMAIL,
      `Counseling session:${client.name}&${counselor.name}`,
      formattedSessionTime.toISOString(),
      60
    );

    // Book the session
    const session = new Session({
      client: clientId,
      counselor: counselorId,
      sessionTime: utcSessionTime,
      sessionType,
      meetingLink: zoomMeeting.join_url,
      meetingId: zoomMeeting.id,
      expiresAt: sessionTime,
    });

    await session.save();

    // Update counselor's and client's history
    counselor.history.push(session._id);
    client.history.push(session._id);
    await counselor.save();
    await client.save();

    // Remove the booked time slot from the counselor's availability
    counselorAvailability.times = counselorAvailability.times.filter(
      (range) => range !== selectedTimeRange
    );
    if (counselorAvailability.times.length === 0) {
      counselor.availability = counselor.availability.filter(
        (availability) =>
          availability.date.toISOString().split("T")[0] !== dateStr
      );
    }

    await counselor.save();

    res.status(201).json({
      message: "Session booked successfully.",
      session,
      meetingLink: zoomMeeting.join_url,
    });
  } catch (error) {
    console.error("Error booking session:", error);
    res
      .status(500)
      .json({ message: "Failed to book session.", error: error.message });
  }
});

//GET BOOKINGS OF SPECIFIC USER

sessionRouter.get("/bookings/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.user;

    let bookings;
    const now = new Date(); // Get the current time

    // Remove expired sessions
    await Session.deleteMany({ sessionTime: { $lt: now } });

    if (role === "client") {
      bookings = await Session.find({
        client: userId,
        sessionTime: { $gte: now },
      })
        .populate("client", "name email")
        .populate("counselor", "name email")
        .sort({ sessionTime: 1 });
    } else if (role === "counselor") {
      bookings = await Session.find({ counselor: userId })
        .populate("counselor", "name email")
        .populate("client", "name email")
        .sort({ sessionTime: 1 });
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized role for fetching bookings" });
    }

    if (!bookings.length) {
      return res
        .status(404)
        .json({ success: false, message: "No bookings found for this user" });
    }
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching bookings for user:", error);
    return res.status(500).json({
      success: false,
      message: "an error occured while fetching",
    });
  }
});

module.exports = sessionRouter;
