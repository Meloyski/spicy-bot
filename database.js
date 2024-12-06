// require("dotenv").config();
// const mysql = require("mysql2");

// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// // Connect to the database and log the success or failure
// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to the database:", err.stack);
//     return;
//   }
//   console.log("Connected to the database as id " + connection.threadId);
// });

// module.exports = connection; // Export the connection for use in other files

const mysql = require("mysql2");
require("dotenv").config();

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Set the maximum number of connections to the database
  queueLimit: 0, // No limit on the queue of waiting connections
  connectTimeout: 10000, // 10 seconds timeout for initial connection
});

// Wrap the pool with a promise-based API for easier async/await usage
const promisePool = pool.promise();

// Test and validate connections before use
promisePool.on("connection", (connection) => {
  console.log(`[DB CONNECTED] Connection ID: ${connection.threadId}`);
  connection.ping((err) => {
    if (err) console.error(`[DB PING ERROR]`, err);
    else
      console.log(
        `[DB PING SUCCESS] Connection ID: ${connection.threadId} is alive.`
      );
  });
});

module.exports = promisePool;
