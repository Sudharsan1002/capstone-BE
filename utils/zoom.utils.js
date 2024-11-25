const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");

const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_API_BASE_URL = process.env.ZOOM_API_BASE_URL;

async function getZoomAccessToken(params) {
  const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`;

  try {
    console.log("Requesting token from URL:", tokenUrl);
    console.log("Using Client ID:", ZOOM_CLIENT_ID);
    const response = await axios.post(tokenUrl, null, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error fetching Zoom access token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to generate Zoom access token.");
  }
}

async function createZoomMeeting(hostMail, topic, startTime, duration) {
  const accesstoken = await getZoomAccessToken();

  const meetingData = {
    topic,
    type: 2,
    start_time: startTime,
    duration,
    timeZone: "UTC",
    settings: {
      join_before_host: false,
      waiting_room: true,
      approval_type: 1,
    },
  };

  try {
    const response = await axios.post(
      `${ZOOM_API_BASE_URL}/users/${hostMail}/meetings`,
      meetingData,
      {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Zoom meeting:",
      error.response?.data || error.message
    );
    throw new Error("Failed to create Zoom meeting.");
  }
}

module.exports = {
  createZoomMeeting,
};
