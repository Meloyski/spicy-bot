const axios = require("axios");
require("dotenv").config();

const BUNGIE_BASE_URL = "https://www.bungie.net/Platform";

const api = axios.create({
  baseURL: BUNGIE_BASE_URL,
  headers: {
    "X-API-Key": process.env.BUNGIE_API_KEY,
    "Content-Type": "application/json",
  },
});

// Function to get Destiny Profile by membership ID
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

// Function to search for a Destiny player by Bungie name
const searchDestinyPlayerByBungieName = async (bungieName, bungieCode) => {
  try {
    const response = await api.post(
      `/Destiny2/SearchDestinyPlayerByBungieName/-1/`,
      {
        displayName: bungieName,
        displayNameCode: parseInt(bungieCode),
      }
    );
    return response.data.Response;
  } catch (error) {
    console.error("Error searching Destiny player by Bungie name:", error);
    return null;
  }
};

module.exports = {
  getDestinyProfile,
  searchDestinyPlayerByBungieName,
};
