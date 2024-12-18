// const { SlashCommandBuilder } = require("@discordjs/builders");
// const axios = require("axios");
// require("dotenv").config();
// const db = require("../database"); // Import the promise-based connection pool

// // Function to handle retry logic for database queries
// async function queryWithRetry(pool, sql, params, retries = 3) {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const result = await pool.query(sql, params);
//       return result;
//     } catch (error) {
//       if (attempt < retries) {
//         console.warn(
//           `[DB RETRY] Query failed on attempt ${attempt}, retrying...`
//         );
//       } else {
//         console.error(`[DB ERROR] Query failed after ${retries} attempts.`);
//         throw error;
//       }
//     }
//   }
// }

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName("bungie-link")
//     .setDescription("Fetch a membership ID using your Bungie ID.")
//     .addStringOption((option) =>
//       option
//         .setName("bungieid")
//         .setDescription("Your Bungie ID (e.g., Username#0000)")
//         .setRequired(true)
//     ),
//   async execute(interaction) {
//     console.log(
//       `[COMMAND TRIGGERED] bungie-link executed by ${interaction.user.tag}.`
//     );

//     const bungieId = interaction.options.getString("bungieid");
//     const apiKey = process.env.BUNGIE_API_KEY;
//     const userId = interaction.user.id; // Discord user ID

//     console.log(`[USER INPUT] Bungie ID: ${bungieId}`);

//     // Validate the Bungie ID
//     const bungieIdPattern = /^.+#\d{4,}$/; // Matches any name + # + at least 4 digits
//     if (!bungieIdPattern.test(bungieId)) {
//       console.log(`[VALIDATION FAILED] Invalid Bungie ID format.`);
//       await interaction.reply({
//         content:
//           "Invalid Bungie ID format. Please use `Name#Code` (e.g., Username#0000).",
//         ephemeral: true,
//       });
//       return;
//     }

//     console.log(`[VALIDATION SUCCESS] Bungie ID format is valid.`);
//     const [bungieName, bungieCode] = bungieId.split("#");

//     try {
//       console.log(`[STEP 1] Deferring interaction response.`);
//       await interaction.deferReply({ ephemeral: true });

//       console.log(`[STEP 2] Calling Bungie API...`);
//       console.time(`[API CALL TIME]`);
//       const response = await axios.post(
//         `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/-1/`,
//         {
//           displayName: bungieName,
//           displayNameCode: parseInt(bungieCode),
//         },
//         {
//           headers: {
//             "X-API-Key": apiKey,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       console.timeEnd(`[API CALL TIME]`);

//       if (response.data.Response.length > 0) {
//         console.log(`[API SUCCESS] Player data retrieved successfully.`);
//         const player = response.data.Response[0];
//         const membershipId = player.membershipId;

//         console.log(`[STEP 3] Checking if Bungie ID exists in the database.`);
//         const [bungieIdExists] = await queryWithRetry(
//           db,
//           `SELECT * FROM user_roles WHERE bungie_id = ?`,
//           [bungieId]
//         );

//         if (bungieIdExists.length > 0 && bungieIdExists[0].user_id !== userId) {
//           console.log(`[CONFLICT] Bungie ID already assigned to another user.`);
//           await interaction.editReply({
//             content: "⚠️ This Bungie ID is already assigned to another user.",
//           });
//           return;
//         }

//         console.log(`[STEP 4] Checking user data in the database.`);
//         const [existingData] = await queryWithRetry(
//           db,
//           `SELECT * FROM user_roles WHERE user_id = ?`,
//           [userId]
//         );

//         const hasChanges =
//           existingData.length === 0 ||
//           existingData[0].bungie_id !== bungieId ||
//           existingData[0].bungie_member_id !== membershipId;

//         // Fetch roles
//         const poblanoRole = await interaction.guild.roles.fetch(
//           process.env.POBLANO
//         );
//         const spicyFamilyRole = await interaction.guild.roles.fetch(
//           process.env.SPICYFAMILY
//         );

//         if (!poblanoRole || !spicyFamilyRole) {
//           console.error("[ERROR] One or both roles could not be fetched.");
//           await interaction.editReply({
//             content:
//               "An error occurred: Unable to fetch required roles. Please contact @Mod for assistance.",
//           });
//           return;
//         }

//         if (hasChanges) {
//           console.log(`[STEP 5] Updating or inserting user data.`);
//           await queryWithRetry(
//             db,
//             `
//             INSERT INTO user_roles (user_id, username, bungie_id, bungie_member_id)
//             VALUES (?, ?, ?, ?)
//             ON DUPLICATE KEY UPDATE
//               username = VALUES(username),
//               bungie_id = VALUES(bungie_id),
//               bungie_member_id = VALUES(bungie_member_id)
//           `,
//             [userId, interaction.user.username, bungieId, membershipId]
//           );

//           console.log(`[DB SUCCESS] User data updated.`);
//           await interaction.editReply({
//             content: `✅ Your Bungie ID and Membership ID have been successfully updated.\n\n**Bungie ID:** ${bungieId}\n**Membership ID:** ${membershipId}`,
//           });

//           // Update roles
//           await interaction.member.roles.remove(poblanoRole);
//           await interaction.member.roles.add(spicyFamilyRole);
//         } else {
//           console.log(`[NO CHANGES] User data already up to date.`);
//           await interaction.editReply({
//             content: "Your Bungie ID and Membership ID are already up to date.",
//           });

//           // Update roles
//           await interaction.member.roles.remove(poblanoRole);
//           await interaction.member.roles.add(spicyFamilyRole);
//         }
//       } else {
//         console.log(`[API FAILURE] No player found for Bungie ID.`);
//         await interaction.editReply({
//           content:
//             "No player found with the provided Bungie ID. Please double-check your input.",
//         });
//       }
//     } catch (error) {
//       console.error(`[ERROR]`, error);
//       await interaction.editReply({
//         content:
//           "An error occurred while processing your Bungie ID. Please contact @Mod for assistance.",
//       });
//     }
//   },
// };

const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios");
require("dotenv").config();
const db = require("../database"); // Import the promise-based connection pool

// Function to handle retry logic for database queries
async function queryWithRetry(pool, sql, params, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await pool.query(sql, params);
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bungie-link")
    .setDescription("Fetch a membership ID using your Bungie ID.")
    .addStringOption((option) =>
      option
        .setName("bungieid")
        .setDescription("Your Bungie ID (e.g., Username#0000)")
        .setRequired(true)
    ),
  async execute(interaction) {
    console.log(
      `[COMMAND TRIGGERED] bungie-link executed by ${interaction.user.tag}.`
    );

    const bungieId = interaction.options.getString("bungieid");
    const apiKey = process.env.BUNGIE_API_KEY;
    const userId = interaction.user.id; // Discord user ID
    const commandType = "bungie-link"; // Name of the command

    console.log(`[USER INPUT] Bungie ID: ${bungieId}`);

    // Log command usage in spicy_usage table
    try {
      await queryWithRetry(
        db,
        `
      INSERT INTO spicy_usage (command_type, command_timestamp, command_by)
      VALUES (?, NOW(), ?);
    `,
        [commandType, userId]
      );
      console.log(`[DB LOG] Command usage logged in spicy_usage table.`);
    } catch (error) {
      console.error(`[DB ERROR] Failed to log command usage:`, error);
    }

    // Validate the Bungie ID
    const bungieIdPattern = /^.+#\d{4,}$/; // Matches any name + # + at least 4 digits
    if (!bungieIdPattern.test(bungieId)) {
      console.log(`[VALIDATION FAILED] Invalid Bungie ID format.`);
      await interaction.reply({
        content:
          "Invalid Bungie ID format. Please use `Name#Code` (e.g., Username#0000).",
        ephemeral: true,
      });
      return;
    }

    console.log(`[VALIDATION SUCCESS] Bungie ID format is valid.`);
    const [bungieName, bungieCode] = bungieId.split("#");

    try {
      console.log(`[STEP 1] Deferring interaction response.`);
      await interaction.deferReply({ ephemeral: true });

      console.log(`[STEP 2] Calling Bungie API...`);
      console.time(`[API CALL TIME]`);
      const response = await axios.post(
        `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/-1/`,
        {
          displayName: bungieName,
          displayNameCode: parseInt(bungieCode),
        },
        {
          headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      console.timeEnd(`[API CALL TIME]`);

      if (response.data.Response.length > 0) {
        console.log(`[API SUCCESS] Player data retrieved successfully.`);
        const player = response.data.Response[0];
        const membershipId = player.membershipId;

        console.log(`[STEP 3] Checking if Bungie ID exists in the database.`);
        const [bungieIdExists] = await queryWithRetry(
          db,
          `SELECT * FROM user_roles WHERE bungie_id = ?`,
          [bungieId]
        );

        if (bungieIdExists.length > 0 && bungieIdExists[0].user_id !== userId) {
          console.log(`[CONFLICT] Bungie ID already assigned to another user.`);
          await interaction.editReply({
            content: "⚠️ This Bungie ID is already assigned to another user.",
          });
          return;
        }

        console.log(`[STEP 4] Checking user data in the database.`);
        const [existingData] = await queryWithRetry(
          db,
          `SELECT * FROM user_roles WHERE user_id = ?`,
          [userId]
        );

        const hasChanges =
          existingData.length === 0 ||
          existingData[0].bungie_id !== bungieId ||
          existingData[0].bungie_member_id !== membershipId;

        // Fetch roles
        const poblanoRole = await interaction.guild.roles.fetch(
          process.env.POBLANO
        );
        const spicyFamilyRole = await interaction.guild.roles.fetch(
          process.env.SPICYFAMILY
        );

        if (!poblanoRole || !spicyFamilyRole) {
          console.error("[ERROR] One or both roles could not be fetched.");
          await interaction.editReply({
            content:
              "An error occurred: Unable to fetch required roles. Please contact @Mod for assistance.",
          });
          return;
        }

        if (hasChanges) {
          console.log(`[STEP 5] Updating or inserting user data.`);
          await queryWithRetry(
            db,
            `
          INSERT INTO user_roles (user_id, username, bungie_id, bungie_member_id)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            username = VALUES(username),
            bungie_id = VALUES(bungie_id),
            bungie_member_id = VALUES(bungie_member_id)
        `,
            [userId, interaction.user.username, bungieId, membershipId]
          );

          console.log(`[DB SUCCESS] User data updated.`);
          await interaction.editReply({
            content: `✅ Your Bungie ID and Membership ID have been successfully updated.\n\n**Bungie ID:** ${bungieId}\n**Membership ID:** ${membershipId}`,
          });

          // Update roles
          await interaction.member.roles.remove(poblanoRole);
          await interaction.member.roles.add(spicyFamilyRole);
        } else {
          console.log(`[NO CHANGES] User data already up to date.`);
          await interaction.editReply({
            content: "Your Bungie ID and Membership ID are already up to date.",
          });

          // Update roles
          await interaction.member.roles.remove(poblanoRole);
          await interaction.member.roles.add(spicyFamilyRole);
        }
      } else {
        console.log(`[API FAILURE] No player found for Bungie ID.`);
        await interaction.editReply({
          content:
            "No player found with the provided Bungie ID. Please double-check your input.",
        });
      }
    } catch (error) {
      console.error(`[ERROR]`, error);
      await interaction.editReply({
        content:
          "An error occurred while processing your Bungie ID. Please contact @Mod for assistance.",
      });
    }
  },
};
