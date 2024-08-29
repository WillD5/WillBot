import dotenv from "dotenv";
dotenv.config();

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require("node:fs");

import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));

import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { parse } from "node:path";

const annoyThreshold = 10;
const moderationChannelId = process.env.MODERATION_CHANNEL_ID;

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

function getCurrentDate() {
  const dateObj = new Date();
  const DateStr =
    "[" +
    [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][dateObj.getDay()] +
    ", " +
    dateObj.getDate() +
    " " +
    [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][dateObj.getMonth()] +
    " " +
    dateObj.getFullYear() +
    " " +
    formatTime(
      dateObj.getHours().toString(),
      dateObj.getMinutes().toString(),
      dateObj.getSeconds().toString()
    ) +
    "] ";
  return DateStr;
}
function formatTime(hour, minute, second) {
  const hours = hour.length == 1 ? "0" + hour : hour;
  const minutes = minute.length == 1 ? "0" + minute : minute;
  const seconds = second.length == 1 ? "0" + second : second;
  return hours + ":" + minutes + ":" + seconds;
}

const errorLogFilePath = __dirname + "/../errorLog.txt";

function writeErrorLog(message) {
  if (!fs.existsSync(errorLogFilePath)) fs.writeFileSync(errorLogFilePath, "");
  fs.appendFileSync(errorLogFilePath, getCurrentDate() + message + "\n");
}

export function help(message) {
  const embed = new EmbedBuilder()
    .setTitle("Willbot Commands")
    .setColor("29bcc0")
    .setDescription(
      "Here are the numerous commands that are currently available within the bot."
    )
    .setImage("https://i.ytimg.com/vi/YzabKuRnESo/sddefault.jpg")
    .setTimestamp()
    .setFooter({
      text: "Ty for reading my yap <3",
      iconURL:
        "https://cdn.discordapp.com/emojis/903842398491262996.webp?size=128&quality=lossless",
    })
    .addFields(
      {
        name: "!ping",
        value: "Test to see if the bot is online.",
      },
      {
        name: "!hello",
        value: "Greet the bot!",
      },
      {
        name: "!rps (choice)",
        value: "Play rock paper scissors with a highly advanced AI opponent.",
      },
      {
        name: "!8ball (query)",
        value: "Ask the 8ball a question and it will give you an answer!",
      },
      {
        name: "!fight (ping user to fight)",
        value:
          "Fight a user! The bot will send a random win message along a random winner and loser between both users.",
      },
      {
        name: "!rng",
        value: "Generate a random number going from 1 to 100!",
      },
      {
        name: "!diceroll",
        value: "Roll a dice with 6 faces!",
      },
      {
        name: "!membercount",
        value: "Shows the number of members in the server.",
      },
      { name: "!auso", value: "Shows AUSO's key members." },
      { name: "!help", value: "Shows this command!" }
    );
  message.reply({ embeds: [embed] });
}

/**
 * Need to complete descriptions
 */
export function auso(message) {
  const embed = new EmbedBuilder()
    .setTitle("AUSO")
    .setColor("29bcc0")
    .setDescription(
      "Familiarize yourself with the key members of the AUSO team."
    )
    .setImage("https://pbs.twimg.com/media/EpS1HMIXYAcamyj.jpg:large")
    .setTimestamp()
    .setFooter({
      text: "Glory to AUSO.",
      iconURL: "https://pbs.twimg.com/media/EpS1HMIXYAcamyj.jpg:large",
    })
    .addFields(
      {
        name: "Kuzrite - Head Sushunter",
        value: "a sus person",
      },
      {
        name: "WillTheOofer - Deputy Head Sushunter",
        value: "a sus person",
      },
      {
        name: "AliasAltan - Lead Insustigator",
        value: "a sus person",
      },
      {
        name: "Mrs_Sesh2 - Head of Recruitement",
        value: "a sus person",
      },
      {
        name: "Fritz - Senior Sushunter",
        value: "a sus person",
      }
    );
  message.reply({ embeds: [embed] });
}

export function purge(message, threshold, client, interaction) {
  if (
    message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
  ) {
    if (!parseInt(threshold) || parseInt(threshold) < 1) {
      message.reply("Invalid number");
      return;
    }

    let number = interaction ? threshold : parseInt(threshold) + 1;
    client.channels.cache
      .get(moderationChannelId)
      .send(
        message.member.user.username +
          " has purged " +
          String(parseInt(number)) +
          " message(s)."
      );
    message.channel.bulkDelete(threshold);
  } else {
    message.channel.send(":x: Insufficient Permissions");
  }
}

export async function kick(message, query, reason = "", client) {
  if (message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
    if (!query) {
      message.channel.send("You need to specify a user to kick!");
      return;
    }
    var user = "";
    try {
      if (isNumeric(query)) {
        var user = await message.guild.members.fetch(query);
      } else {
        var user = await message.mentions.members.first();
      }
    } catch (e) {
      message.reply("Invalid user");
      return;
    }
    if (user.permissions.has(PermissionsBitField.Flags.Administrator)) {
      message.reply(":x: I cannot kick this user!");
      return;
    }
    const id = user.user.id;
    message.guild.members
      .kick(id, reason)
      .then(() => {
        message.reply(
          ":white_check_mark: | " +
            user.user.username +
            " has been successfully kicked."
        );
        client.channels.cache
          .get(moderationChannelId)
          .send(
            message.member.user.username + " has kicked " + user.user.username
          );
      })
      .catch((e) => {
        message.reply(
          ":x: | An error has occured, contact the Bot Maintainer."
        );
        writeErrorLog("Error while trying to kick user: " + e);
      });
  } else {
    message.reply("Invalid Permissions");
  }
}

export async function ban(message, query, reason = "", client) {
  if (message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
    if (!query) {
      message.reply("You need to specify a user to ban!");
      return;
    }
    var user = "";
    var id = 0;
    var isServerMember = true;
    try {
      if (isNumeric(query)) {
        id = query;
        try {
          user = await message.guild.members.fetch(query);
        } catch (e) {
          user = await client.users.fetch(query);
          isServerMember = false;
        }
      } else {
        user = await message.mentions.members.first();
        id = user.user.id;
      }
    } catch (e) {
      message.reply("Invalid user");
      return;
    }
    var username = "";
    if (isServerMember) {
      if (user.permissions.has(PermissionsBitField.Flags.Administrator)) {
        message.reply(":x: I cannot ban this user!");
        return;
      }
      username = user.user.username;
    } else username = user.username;
    message.guild.members
      .ban(id, { reason: reason })
      .then(() => {
        message.reply(
          ":white_check_mark: | " + username + " has been successfully banned."
        );
        client.channels.cache
          .get(moderationChannelId)
          .send(message.member.user.username + " has banned " + username);
      })
      .catch((e) => {
        message.reply(
          ":x: | An error has occured, contact the Bot Maintainer."
        );
        writeErrorLog("Error while trying to ban user: " + e);
      });
  } else {
    message.reply("Invalid Permissions");
  }
}

export function unban(message, id, reason = "", client) {
  if (message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
    if (!id || !isNumeric(id)) {
      message.reply("Invalid user id.");
      return;
    }
    message.guild.members
      .unban(id, reason)
      .then(() => {
        message.channel.send(
          ":white_check_mark: | user has been successfully unbanned."
        );
        client.channels.cache
          .get(moderationChannelId)
          .send(
            message.member.user.username + " has unbanned user with id: " + id
          );
      })
      .catch((e) => {
        message.reply(":x: | User is not banned.");
      });
  } else {
    message.reply("Invalid Permissions");
  }
}

export async function annoy(message, query, threshold = annoyThreshold) {
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    if (!query) {
      message.reply("You need to specify a user to annoy!");
      return;
    }
    const sendPromises = [];

    for (let i = 0; i < annoyThreshold; i++) {
      sendPromises.push(message.channel.send(query));
    }

    await Promise.all(sendPromises);

    message.channel
      .bulkDelete(threshold)
      .catch((err) =>
        writeErrorLog("Error while trying to annoy user: " + err)
      );
  } else {
    message.reply("You do not have permission to use this command.");
    return;
  }
}
export function rps(message, userChoice) {
  let choices = ["rock", "paper", "scissors"];
  const botChoice = choices[Math.floor(Math.random() * 3)];
  if (choices.includes(userChoice)) {
    if (userChoice === botChoice) {
      message.reply("It's a tie!");
    } else if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper")
    ) {
      message.reply("You win!");
    } else {
      message.reply("You lose!");
    }
  } else {
    message.reply("Invalid choice");
  }
}
/**
 * May add some other scenarios (thanks ChatGPT lmao)
 */
export function fight(message, author, user) {
  if (!user) {
    message.reply("You need to specify a user to fight!");
    return;
  }

  if (author.id === user.id) {
    message.reply("You can't fight yourself!");
    return;
  }
  let scenariosBeginning = [
    "tripped over",
    "threw a rock at",
    "sent",
    "kicked",
    "punched",
    "tosses a banana peel on the ground, causing",
    "holds up a mirror, and",
    "has a powerful sneeze that sends",
    "has a cute puppy run into the fight, and",
  ];
  let scenariosEnding = [
    ".",
    ".",
    " to space.",
    " in the face.",
    " in the gut.",
    " to slip and fall.",
    " is so shocked by their own reflection that they trip over their own feet and fall.",
    " flying across the room.",
    " is so distracted by the adorable pup that they forget to defend themselves.",
  ];
  let option = Math.floor(Math.random() * scenariosBeginning.length);
  let winner = [author, user][Math.floor(Math.random() * 2)];
  let loser = winner === author ? user : author;
  message.reply(
    winner.username +
      " " +
      scenariosBeginning[option] +
      " " +
      loser.username +
      scenariosEnding[option]
  );
}

export function eightball(message, query) {
  if (!query) {
    message.reply("You need to ask a question!");
    return;
  }
  let responses = [
    "Yes",
    "No",
    "Maybe",
    "Ask again later",
    "Most likely",
    "Most unlikely",
    "I don't know",
    "I don't think so",
    "I think so",
  ];
  message.reply(responses[Math.floor(Math.random() * responses.length)]);
}

export function rng(message) {
  message.reply(Math.floor(Math.random() * 100).toString());
}

export function diceroll(message) {
  const number = Math.floor(Math.random() * 6) + 1;
  message.reply("You roled a **" + number.toString() + "**!");
}

export function membercount(message) {
  const memberCount = message.guild.memberCount.toString();
  message.reply("The server curently has **" + memberCount + "** members.");
}
