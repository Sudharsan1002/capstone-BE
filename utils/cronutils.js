const cron = require("node-cron");
const Session = require("./models/sessionModel");

// Schedule a job to run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running cleanup job for expired sessions...");
  try {
    const now = new Date();
    const result = await Session.deleteMany({ sessionTime: { $lt: now } });
    console.log(`Deleted ${result.deletedCount} expired sessions.`);
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error.message);
  }
});
