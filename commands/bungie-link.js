// const { SlashCommandBuilder } = require("@discordjs/builders");
// const axios = require("axios");
// const dotenv = require("dotenv");
// const connection = require("../database");

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
//     const bungieId = interaction.options.getString("bungieid");
//     const apiKey = process.env.BUNGIE_API_KEY;
//     const userId = interaction.user.id; // Discord user ID

//     // Validate the Bungie ID
//     const bungieIdPattern = /^.+#\d{4,}$/; // Matches any name + # + at least 4 digits
//     if (!bungieIdPattern.test(bungieId)) {
//       await interaction.reply({
//         content:
//           "Invalid Bungie ID format. Please use `Name#Code` (e.g., Username#0000).",
//         ephemeral: true,
//       });
//       return;
//     }

//     // Split the Bungie ID into name and code
//     const [bungieName, bungieCode] = bungieId.split("#");

//     try {
//       await interaction.deferReply({ ephemeral: true }); // Wait for API call, visible only to the user

//       // Call the Bungie API
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

//       if (response.data.Response.length > 0) {
//         const player = response.data.Response[0];
//         const membershipId = player.membershipId;

//         // Update database with both Bungie ID and membership ID
//         const query = `
//           INSERT INTO user_roles (user_id, username, bungie_id, bungie_member_id)
//           VALUES (?, ?, ?, ?)
//           ON DUPLICATE KEY UPDATE
//             username = VALUES(username),
//             bungie_id = VALUES(bungie_id),
//             bungie_member_id = VALUES(bungie_member_id)
//         `;
//         const values = [
//           userId,
//           interaction.user.username,
//           bungieId,
//           membershipId,
//         ];

//         connection.query(query, values, (err, result) => {
//           if (err) {
//             console.error("Error updating database:", err);
//             interaction.editReply({
//               content:
//                 "An error occurred while updating your Bungie ID. Please contact @Mod for assistance.",
//             });
//             return;
//           }

//           // Determine response message based on affected rows
//           const message =
//             result.affectedRows === 1
//               ? "✅ Your Bungie ID and Membership ID have been successfully added to the database."
//               : "✅ Your Bungie ID and Membership ID have been successfully updated in the database.";

//           interaction.editReply({
//             content: `${message}\n\n**Bungie ID:** ${bungieId}\n**Membership ID:** ${membershipId}`,
//           });
//         });
//       } else {
//         await interaction.editReply({
//           content:
//             "No player found with the provided Bungie ID. Please double-check your input. 😞",
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching player information:", error);
//       await interaction.editReply({
//         content:
//           "An error occurred while fetching your Bungie ID. Please contact @Mod for assistance.",
//       });
//     }
//   },
// };

// Working Version Without Add/Update Message

// const { SlashCommandBuilder } = require("@discordjs/builders");
// const axios = require("axios");
// const dotenv = require("dotenv");
// const connection = require("../database");

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
//     const bungieId = interaction.options.getString("bungieid");
//     const apiKey = process.env.BUNGIE_API_KEY;
//     const userId = interaction.user.id; // Discord user ID

//     // Validate the Bungie ID
//     const bungieIdPattern = /^.+#\d{4,}$/; // Matches any name + # + at least 4 digits
//     if (!bungieIdPattern.test(bungieId)) {
//       await interaction.reply({
//         content:
//           "Invalid Bungie ID format. Please use `Name#Code` (e.g., Username#0000).",
//         ephemeral: true,
//       });
//       return;
//     }

//     // Split the Bungie ID into name and code
//     const [bungieName, bungieCode] = bungieId.split("#");

//     try {
//       await interaction.deferReply({ ephemeral: true }); // Wait for API call, visible only to the user

//       // Call the Bungie API
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

//       if (response.data.Response.length > 0) {
//         const player = response.data.Response[0];
//         const membershipId = player.membershipId;

//         // Update database with both Bungie ID and membership ID
//         const query = `
//           INSERT INTO user_roles (user_id, username, bungie_id, bungie_member_id)
//           VALUES (?, ?, ?, ?)
//           ON DUPLICATE KEY UPDATE
//             username = VALUES(username),
//             bungie_id = VALUES(bungie_id),
//             bungie_member_id = VALUES(bungie_member_id)
//         `;
//         const values = [
//           userId,
//           interaction.user.username,
//           bungieId,
//           membershipId,
//         ];

//         // Wrapping the query inside a Promise to make it awaitable
//         const executeQuery = () => {
//           return new Promise((resolve, reject) => {
//             connection.query(query, values, (err, result) => {
//               if (err) reject(err);
//               resolve(result);
//             });
//           });
//         };

//         try {
//           const result = await executeQuery(); // Wait for query to complete

//           // Determine response message based on affected rows
//           const message =
//             result.affectedRows === 1
//               ? "✅ Your Bungie ID and Membership ID have been successfully added to the database."
//               : "✅ Your Bungie ID and Membership ID have been successfully updated in the database.";

//           // Send confirmation message to the user
//           await interaction.editReply({
//             content: `${message}\n\n**Bungie ID:** ${bungieId}\n**Membership ID:** ${membershipId}`,
//           });

//           // **Assign/Change roles based on success**
//           try {
//             // Fetch member by Discord ID
//             const member = await interaction.guild.members.fetch(userId);
//             if (!member) {
//               throw new Error("Member not found.");
//             }

//             // Replace these with your actual Role IDs
//             const poblanoRoleId = "1298628177249435648"; // Replace with actual Role ID for Poblano
//             const spicyFamilyRoleId = "1176516166898942074"; // Replace with actual Role ID for Spicy Family

//             // Check if the member has the "Poblano" role
//             if (member.roles.cache.has(poblanoRoleId)) {
//               // Remove "Poblano" role and add "Spicy Family"
//               await member.roles.remove(poblanoRoleId);
//               await member.roles.add(spicyFamilyRoleId);
//               await interaction.followUp({
//                 content: "🔥🌶️ Welcome to the **Spicy Family**! 🌶️🔥",
//                 ephemeral: true,
//               });
//             } else if (!member.roles.cache.has(spicyFamilyRoleId)) {
//               // If they don't have "Spicy Family", give it to them
//               await member.roles.add(spicyFamilyRoleId);
//               await interaction.followUp({
//                 content: "🔥🌶️ Welcome to the **Spicy Family**! 🌶️🔥",
//                 ephemeral: true,
//               });
//             }
//           } catch (error) {
//             console.error("Error assigning or removing roles:", error);
//             await interaction.followUp({
//               content:
//                 "An error occurred while assigning the role. Please contact @Mod for assistance.",
//             });
//           }
//         } catch (error) {
//           console.error("Error updating database:", error);
//           await interaction.editReply({
//             content:
//               "An error occurred while updating your Bungie ID. Please contact @Mod for assistance.",
//           });
//         }
//       } else {
//         await interaction.editReply({
//           content:
//             "No player found with the provided Bungie ID. Please double-check your input.",
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching player information:", error);
//       await interaction.editReply({
//         content:
//           "An error occurred while fetching your Bungie ID. Please contact @Mod for assistance.",
//       });
//     }
//   },
// };

// Updated with Role Logic and Messages

// const { SlashCommandBuilder } = require("@discordjs/builders");
// const axios = require("axios");
// const dotenv = require("dotenv");
// const connection = require("../database");

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
//     const bungieId = interaction.options.getString("bungieid");
//     const apiKey = process.env.BUNGIE_API_KEY;
//     const userId = interaction.user.id; // Discord user ID

//     // Validate the Bungie ID
//     const bungieIdPattern = /^.+#\d{4,}$/; // Matches any name + # + at least 4 digits
//     if (!bungieIdPattern.test(bungieId)) {
//       await interaction.reply({
//         content:
//           "Invalid Bungie ID format. Please use `Name#Code` (e.g., Username#0000).",
//         ephemeral: true,
//       });
//       return;
//     }

//     // Split the Bungie ID into name and code
//     const [bungieName, bungieCode] = bungieId.split("#");

//     try {
//       await interaction.deferReply({ ephemeral: true }); // Wait for API call, visible only to the user

//       // Call the Bungie API
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

//       if (response.data.Response.length > 0) {
//         const player = response.data.Response[0];
//         const membershipId = player.membershipId;

//         // Query existing data to check if any values have changed
//         const checkQuery = `SELECT * FROM user_roles WHERE user_id = ?`;
//         const checkValues = [userId];

//         const executeCheckQuery = () => {
//           return new Promise((resolve, reject) => {
//             connection.query(checkQuery, checkValues, (err, result) => {
//               if (err) reject(err);
//               resolve(result);
//             });
//           });
//         };

//         const existingData = await executeCheckQuery(); // Get the current data for comparison

//         // Log the existing data and new data to debug the comparison
//         console.log("Existing Data:", existingData);
//         console.log("New Bungie ID:", bungieId);
//         console.log("New Membership ID:", membershipId);

//         // Check if the Bungie ID or Membership ID has changed
//         const hasChanges =
//           existingData.length === 0 ||
//           existingData[0].bungie_id !== bungieId ||
//           existingData[0].bungie_member_id !== membershipId;

//         if (hasChanges) {
//           // Proceed with the update since values are different
//           const query = `
//             INSERT INTO user_roles (user_id, username, bungie_id, bungie_member_id)
//             VALUES (?, ?, ?, ?)
//             ON DUPLICATE KEY UPDATE
//               username = VALUES(username),
//               bungie_id = VALUES(bungie_id),
//               bungie_member_id = VALUES(bungie_member_id)
//           `;
//           const values = [
//             userId,
//             interaction.user.username,
//             bungieId,
//             membershipId,
//           ];

//           // Wrapping the query inside a Promise to make it awaitable
//           const executeQuery = () => {
//             return new Promise((resolve, reject) => {
//               connection.query(query, values, (err, result) => {
//                 if (err) reject(err);
//                 resolve(result);
//               });
//             });
//           };

//           try {
//             const result = await executeQuery(); // Wait for query to complete

//             // Log the result to see how many rows were affected
//             console.log("Result:", result);

//             // Determine response message based on whether values were changed
//             const message =
//               existingData.length === 0 || result.changedRows > 0
//                 ? "✅ Your Bungie ID and Membership ID have been successfully updated in the database."
//                 : "✅ Your Bungie ID and Membership ID have been successfully added to the database.";

//             // Send confirmation message to the user
//             await interaction.editReply({
//               content: `${message}\n\n**Bungie ID:** ${bungieId}\n**Membership ID:** ${membershipId}`,
//             });
//           } catch (error) {
//             console.error("Error updating database:", error);
//             await interaction.editReply({
//               content:
//                 "An error occurred while updating your Bungie ID. Please contact @Mod for assistance.",
//             });
//           }
//         } else {
//           // No changes detected
//           await interaction.editReply({
//             content: "Your Bungie ID and Membership ID are already up to date.",
//           });
//         }

//         // **Assign/Change roles based on success**
//         try {
//           // Fetch member by Discord ID
//           const member = await interaction.guild.members.fetch(userId);
//           if (!member) {
//             throw new Error("Member not found.");
//           }

//           // Replace these with your actual Role IDs
//           const poblanoRoleId = "1298628177249435648"; // Replace with actual Role ID for Poblano
//           const spicyFamilyRoleId = "1176516166898942074"; // Replace with actual Role ID for Spicy Family

//           // Check if the member has the "Poblano" role
//           if (member.roles.cache.has(poblanoRoleId)) {
//             // Remove "Poblano" role and add "Spicy Family"
//             await member.roles.remove(poblanoRoleId);
//             await member.roles.add(spicyFamilyRoleId);
//             await interaction.followUp({
//               content: "🔥🌶️ Welcome to the **Spicy Family**! 🌶️🔥",
//               ephemeral: true,
//             });
//           } else if (!member.roles.cache.has(spicyFamilyRoleId)) {
//             // If they don't have "Spicy Family", give it to them
//             await member.roles.add(spicyFamilyRoleId);
//             await interaction.followUp({
//               content: "🔥🌶️ Welcome to the **Spicy Family**! 🌶️🔥",
//               ephemeral: true,
//             });
//           }
//         } catch (error) {
//           console.error("Error assigning or removing roles:", error);
//           await interaction.followUp({
//             content:
//               "An error occurred while assigning the role. Please contact @Mod for assistance.",
//           });
//         }
//       } else {
//         await interaction.editReply({
//           content:
//             "No player found with the provided Bungie ID. Please double-check your input.",
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching player information:", error);
//       await interaction.editReply({
//         content:
//           "An error occurred while fetching your Bungie ID. Please contact @Mod for assistance.",
//       });
//     }
//   },
// };

const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios");
const dotenv = require("dotenv");
const connection = require("../database");

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
    const bungieId = interaction.options.getString("bungieid");
    const apiKey = process.env.BUNGIE_API_KEY;
    const userId = interaction.user.id; // Discord user ID

    // Validate the Bungie ID
    const bungieIdPattern = /^.+#\d{4,}$/; // Matches any name + # + at least 4 digits
    if (!bungieIdPattern.test(bungieId)) {
      await interaction.reply({
        content:
          "Invalid Bungie ID format. Please use `Name#Code` (e.g., Username#0000).",
        ephemeral: true,
      });
      return;
    }

    // Split the Bungie ID into name and code
    const [bungieName, bungieCode] = bungieId.split("#");

    try {
      await interaction.deferReply({ ephemeral: true }); // Wait for API call, visible only to the user

      // Call the Bungie API
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

      if (response.data.Response.length > 0) {
        const player = response.data.Response[0];
        const membershipId = player.membershipId;

        // Check if the Bungie ID is already assigned to another user
        const checkBungieIdQuery = `SELECT * FROM user_roles WHERE bungie_id = ?`;
        const checkBungieIdValues = [bungieId];

        const executeCheckBungieIdQuery = () => {
          return new Promise((resolve, reject) => {
            connection.query(
              checkBungieIdQuery,
              checkBungieIdValues,
              (err, result) => {
                if (err) reject(err);
                resolve(result);
              }
            );
          });
        };

        const bungieIdExists = await executeCheckBungieIdQuery();

        // If the Bungie ID is already linked to another user, respond with an error
        if (bungieIdExists.length > 0 && bungieIdExists[0].user_id !== userId) {
          await interaction.editReply({
            content: "⚠️ This Bungie ID is already assigned to another user.",
          });
          return;
        }

        // Proceed to check if the user's data needs updating
        const checkQuery = `SELECT * FROM user_roles WHERE user_id = ?`;
        const checkValues = [userId];

        const executeCheckQuery = () => {
          return new Promise((resolve, reject) => {
            connection.query(checkQuery, checkValues, (err, result) => {
              if (err) reject(err);
              resolve(result);
            });
          });
        };

        const existingData = await executeCheckQuery(); // Get the current data for comparison

        // Log the existing data and new data to debug the comparison
        console.log("Existing Data:", existingData);
        console.log("New Bungie ID:", bungieId);
        console.log("New Membership ID:", membershipId);

        // Check if the Bungie ID or Membership ID has changed
        const hasChanges =
          existingData.length === 0 ||
          existingData[0].bungie_id !== bungieId ||
          existingData[0].bungie_member_id !== membershipId;

        if (hasChanges) {
          // Proceed with the update since values are different
          const query = `
            INSERT INTO user_roles (user_id, username, bungie_id, bungie_member_id)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              username = VALUES(username),
              bungie_id = VALUES(bungie_id),
              bungie_member_id = VALUES(bungie_member_id)
          `;
          const values = [
            userId,
            interaction.user.username,
            bungieId,
            membershipId,
          ];

          // Wrapping the query inside a Promise to make it awaitable
          const executeQuery = () => {
            return new Promise((resolve, reject) => {
              connection.query(query, values, (err, result) => {
                if (err) reject(err);
                resolve(result);
              });
            });
          };

          try {
            const result = await executeQuery(); // Wait for query to complete

            // Log the result to see how many rows were affected
            console.log("Result:", result);

            // Determine response message based on whether values were changed
            const message =
              existingData.length === 0 || result.changedRows > 0
                ? "✅ Your Bungie ID and Membership ID have been successfully updated in the database."
                : "✅ Your Bungie ID and Membership ID have been successfully added to the database.";

            // Send confirmation message to the user
            await interaction.editReply({
              content: `${message}\n\n**Bungie ID:** ${bungieId}\n**Membership ID:** ${membershipId}`,
            });
          } catch (error) {
            console.error("Error updating database:", error);
            await interaction.editReply({
              content:
                "An error occurred while updating your Bungie ID. Please contact @Mod for assistance.",
            });
          }
        } else {
          // No changes detected
          await interaction.editReply({
            content: "Your Bungie ID and Membership ID are already up to date.",
          });
        }

        // **Assign/Change roles based on success**
        try {
          // Fetch member by Discord ID
          const member = await interaction.guild.members.fetch(userId);
          if (!member) {
            throw new Error("Member not found.");
          }

          // Replace these with your actual Role IDs
          const poblanoRoleId = "1298628177249435648"; // Replace with actual Role ID for Poblano
          const spicyFamilyRoleId = "1176516166898942074"; // Replace with actual Role ID for Spicy Family

          // Check if the member has the "Poblano" role
          if (member.roles.cache.has(poblanoRoleId)) {
            // Remove "Poblano" role and add "Spicy Family"
            await member.roles.remove(poblanoRoleId);
            await member.roles.add(spicyFamilyRoleId);
            await interaction.followUp({
              content: "🔥🌶️ Welcome to the **Spicy Family**! 🌶️🔥",
              ephemeral: true,
            });
          } else if (!member.roles.cache.has(spicyFamilyRoleId)) {
            // If they don't have "Spicy Family", give it to them
            await member.roles.add(spicyFamilyRoleId);
            await interaction.followUp({
              content: "🔥🌶️ Welcome to the **Spicy Family**! 🌶️🔥",
              ephemeral: true,
            });
          }
        } catch (error) {
          console.error("Error assigning or removing roles:", error);
          await interaction.followUp({
            content:
              "An error occurred while assigning the role. Please contact @Mod for assistance.",
          });
        }
      } else {
        await interaction.editReply({
          content:
            "No player found with the provided Bungie ID. Please double-check your input.",
        });
      }
    } catch (error) {
      console.error("Error fetching player information:", error);
      await interaction.editReply({
        content:
          "An error occurred while fetching your Bungie ID. Please contact @Mod for assistance.",
      });
    }
  },
};
