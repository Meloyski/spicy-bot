const axios = require("axios");
require("dotenv").config();

const BUNGIE_BASE_URL = "https://www.bungie.net/Platform";

const api = axios.create({
  baseURL: BUNGIE_BASE_URL,
  headers: {
    "X-API-Key": process.env.BUNGIE_API_KEY,
  },
});

// Example: Get Destiny Profile
const getDestinyProfile = async (membershipId, membershipType) => {
  try {
    const response = await api.get(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=100`
    );
    return response.data.Response;
  } catch (error) {
    console.error("Error fetching Destiny profile:", error);
    return null;
  }
};

module.exports = {
  getDestinyProfile,
};
