const db = require("../database"); // Import the database connection

// Function to handle retry logic for database queries
async function queryWithRetry(sql, params = [], retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const [result] = await db.query(sql, params);
      return result;
    } catch (error) {
      if (attempt < retries) {
        console.warn(
          `[DB RETRY] Query failed on attempt ${attempt}, retrying...`
        );
      } else {
        console.error(`[DB ERROR] Query failed after ${retries} attempts.`);
        throw error;
      }
    }
  }
}

// Export the function for use in other files
module.exports = queryWithRetry;
