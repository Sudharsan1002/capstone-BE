const express = require("express");
const authenticateToken = require("../middlewares/jwtguard");
const usermodel = require("../models/usermodel");
const availrouter = express.Router();



//METHOD:POST
//ROUTE TO PROVIDE FEATURE TO ADD AVAILABILITY FOR COUNSELOR

availrouter.post("/", authenticateToken, async (req, res) => {
  const availability = req.body;

  // Validate availability format
  const isValidAvailability = (availability) =>
    Array.isArray(availability) &&
    availability.every(
      (item) =>
        item.date &&
        !isNaN(new Date(item.date)) &&
        Array.isArray(item.times) &&
        item.times.every(
          (time) =>
            typeof time === "string" &&
            time.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/)
        )
    );

  if (!isValidAvailability(availability)) {
    return res.status(400).json({
      message:
        "Invalid data. Each item must have a valid date and time ranges.",
    });
  }

  try {
    // Ensure the user is a counselor
    if (req.user.role !== "counselor") {
      return res.status(403).json({
        message: "Access denied. Only counselors can update availability.",
      });
    }

    const userId = req.user.id;
    const counselor = await usermodel.findById(userId);

    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found." });
    }

    // Log initial availability to check what's coming from the body
    console.log("Incoming Availability:", availability);

    const currentDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format

    // Restrict past dates
    const pastDates = availability.filter(
      (item) => new Date(item.date).toISOString().split("T")[0] < currentDate
    );

    if (pastDates.length > 0) {
      return res.status(400).json({
        message: `Past dates are not allowed. Invalid dates: ${pastDates
          .map((d) => d.date)
          .join(", ")}`,
      });
    }

    // Merge new availability into existing availability
    const updatedAvailability = [...counselor.availability];
    console.log("Current Availability:", updatedAvailability);

    availability.forEach((newSlot) => {
      const normalizedDate = new Date(newSlot.date).toISOString().split("T")[0]; // Normalize date

      // Log to check if the date is being normalized properly
      console.log("Normalized Date:", normalizedDate);

      // Validate and clean time ranges
      const validTimes = newSlot.times
        .map((time) => {
          const [start, end] = time.split("-");
          return start < end ? time : null; // Ensure valid time range
        })
        .filter(Boolean);

      if (validTimes.length > 0) {
        // Find if a slot already exists for this date
        const existingSlot = updatedAvailability.find(
          (slot) =>
            new Date(slot.date).toISOString().split("T")[0] === normalizedDate
        );

        // Log to check if we're finding the existing slot
        console.log("Existing Slot Found:", existingSlot);

        if (existingSlot) {
          // Merge times without duplicates (combine both and remove duplicates)
          const mergedTimes = new Set([...existingSlot.times, ...validTimes]);
          existingSlot.times = Array.from(mergedTimes).sort(); // Sort times for consistency

          // Log to check if times are being merged properly
          console.log("Merged Times:", existingSlot.times);
        } else {
          // Add new slot for this date
          updatedAvailability.push({
            date: normalizedDate,
            times: validTimes,
          });

          // Log new slot addition
          console.log("New Slot Added:", updatedAvailability);
        }
      }
    });

    // Sort availability by date
    updatedAvailability.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Log final availability before saving
    console.log("Final Availability Before Save:", updatedAvailability);

    // Save updated availability
    counselor.availability = updatedAvailability;
    await counselor.save();

    res.status(200).json({
      message: "Availability updated successfully.",
      availability: counselor.availability,
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({
      message: "An error occurred while updating availability.",
      error: error.message,
    });
  }
});




//METHOD:GET
//ROUTE TO FETCH AVAILABILITIES FOR SELECTED COUNSELOR

availrouter.get("/:counselorId", authenticateToken, async (req, res) => {
  const { counselorId } = req.params;

  try {
    const counselor = await usermodel
      .findById(counselorId)
      .select("availability role");

    if (!counselor || counselor.role !== "counselor") {
      return res.status(404).json({
        message: "Counselor not found or invalid user.",
      });
    }

    res.status(200).json({
      message: "Availability fetched successfully.",
      availability: counselor.availability,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching availability.",
      error: error.message,
    });
  }
});

module.exports = availrouter;
