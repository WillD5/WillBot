/**
 * A general purpose discord bot, currently used for fun and moderation mainly.
 * Credits to bluejer1 for the original code.
 */

import dotenv from "dotenv";
dotenv.config();

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require("node:fs");

import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));

import {
  Client,
  REST,
  Routes,
  GatewayIntentBits,
  PermissionsBitField,
  ActivityType,
  EmbedBuilder,
} from "discord.js";

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

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
  {
    name: "hello",
    description: "Replies with Hello!",
  },
  {
    name: "help",
    description: "Shows commands summary.",
  },
  {
    name: "auso",
    description: "Shows information about the AUSO team.",
  },
  {
    name: "rps",
    description: "Play rock paper scissors with the bot!",
    options: [
      {
        name: "choice",
        description: "Your choice of rock, paper, or scissors.",
        type: 3,
        required: true,
        choices: [
          {
            name: "Rock",
            value: "rock",
          },
          {
            name: "Paper",
            value: "paper",
          },
          {
            name: "Scissors",
            value: "scissors",
          },
        ],
      },
    ],
  },
  {
    name: "8ball",
    description: "Ask the 8ball a question and it will give you an answer!",
    options: [
      {
        name: "query",
        description: "Question to ask the 8ball",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "rng",
    description: "Generates a random number from 1 to 100.",
  },
  {
    name: "diceroll",
    description: "Roll a 6-faced dice!",
  },
  {
    name: "membercount",
    description: "Shows the number of members currently in the server.",
  },
  {
    name: "annoy",
    description: "Pings a user 10 times and deletes the messages. (Admin+)",
    options: [
      {
        name: "user",
        description: "User to annoy.",
        type: 6,
        required: true,
      },
    ],
  },
  {
    name: "fight",
    description: "Fights a user.",
    options: [
      {
        name: "user",
        description: "User to fight.",
        type: 6,
        required: true,
      },
    ],
  },
  {
    name: "purge",
    description: "Deletes a certain number of messages. (Mod+)",
    options: [
      {
        name: "number",
        description: "Number of messages to delete",
        type: 4,
        required: true,
      },
    ],
  },
  {
    name: "kick",
    description: "Kicks the pinged user. (Mod+)",
    options: [
      {
        name: "user",
        description: "User to kick.",
        type: 6,
        required: true,
      },
    ],
  },
  {
    name: "ban",
    description: "Bans the pinged user. (Mod+)",
    options: [
      {
        name: "user",
        description: "User to ban.",
        type: 6,
        required: true,
      },
    ],
  },
  {
    name: "unban",
    description: "Unbans a user by their id. (Mod+)",
    options: [
      {
        name: "id",
        description: "Id of user to unban",
        type: 3,
        required: true,
      },
    ],
  },
];

const prefix = "!";
const updatesChannelId = process.env.STATUS_CHANNEL_ID;
const moderationChannelId = process.env.MODERATION_CHANNEL_ID;

const annoyThreshold = 10;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

async function setCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

function help(message) {
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
        value: "Fight a user! The bot will send a random win message along a random winner and loser between both users.",
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
function auso(message) {
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

function purge(message, number) {
  if (
    message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
  ) {
    client.channels.cache
      .get(moderationChannelId)
      .send(
        message.members.user.username + " has purged " + number + " messages."
      );
    message.channel.bulkDelete(number);
  } else {
    message.channel.send(":x: Insufficient Permissions");
  }
}

async function kick(message, query, reason = "") {
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
            "User " +
              message.member.user.username +
              " has kicked " +
              user.user.username
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

async function ban(message, query, reason = "") {
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
          .send(
            "User " + message.member.user.username + " has banned " + username
          );
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

function unban(message, id, reason = "") {
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
            "User" +
              message.member.user.username +
              " has unbanned user with id:" +
              id
          );
      })
      .catch((e) => {
        message.reply(":x: | User is not banned.");
      });
  } else {
    message.reply("Invalid Permissions");
  }
}

async function annoy(message, query, threshold = annoyThreshold) {
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
function RockPaperScissors(message, userChoice) {
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
function fight(message, author, user) {
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

function eightball(message, query) {
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

function rng(message) {
  message.reply(Math.floor(Math.random() * 100).toString());
}

function diceroll(message) {
  const number = Math.floor(Math.random() * 6) + 1;
  message.reply("You roled a **" + number.toString() + "**!");
}

function membercount(message) {
  const memberCount = message.guild.memberCount.toString();
  message.reply("The server curently has **" + memberCount + "** members.");
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [
      {
        name: `Tornadic Studios' Comeback`,
        type: ActivityType.Watching,
      },
    ],
    status: "dnd",
  });
  setCommands();
  if (process.env.ENVIRONMENT === "PROD")
    client.channels.cache.get(updatesChannelId).send("i have awoken");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  let args = message.content.substring(prefix.length).split(" ");
  switch (args[0]) {
    case "ping":
      message.reply("Pong!");
      break;
    case "hello":
      message.reply("Hello!");
      break;
    case "help":
      help(message);
      break;
    case "auso":
      auso(message);
      break;
    case "rps":
      RockPaperScissors(message, args[1]);
      break;
    case "8ball":
      eightball(message, args.join(" ").substring(6));
      break;
    case "rng":
      rng(message);
      break;
    case "membercount":
      membercount(message);
      break;
    case "diceroll":
      diceroll(message);
      break;
    case "purge":
      let number = 0;
      try {
        number = parseInt(args[1]) + 1;
      } catch (e) {
        message.reply("Invalid number");
      }
      purge(message, number);
      break;
    case "annoy":
      annoy(message, args[1], annoyThreshold + 1);
      break;
    case "fight":
      fight(message, message.author, message.mentions.users.first());
      break;
    case "kick":
      kick(message, args[1], args[2]);
      break;
    case "ban":
      ban(message, args[1], args[2]);
      break;
    case "unban":
      unban(message, args[1], args[2]);
      break;
    default:
      message.reply("Invalid command");
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  let user = "";
  let query = "";
  switch (interaction.commandName) {
    case "ping":
      await interaction.reply("Pong!");
      break;
    case "hello":
      await interaction.reply("Hello!");
      break;
    case "rps":
      RockPaperScissors(interaction, interaction.options.getString("choice"));
      break;
    case "8ball":
      eightball(interaction, interaction.options.getString("query"));
      break;
    case "rng":
      rng(interaction);
      break;
    case "diceroll":
      diceroll(interaction);
      break;
    case "help":
      help(interaction);
      break;
    case "auso":
      auso(interaction);
      break;
    case "membercount":
      membercount(interaction);
      break;
    case "purge":
      let number = interaction.options.getInteger("number");
      purge(interaction, number);
      interaction.reply({
        content: "Purged " + number + " messages.",
        ephemeral: true,
      });
      break;
    case "annoy":
      user = interaction.options.getUser("user");
      query = "<@" + user.id + ">";
      annoy(interaction, query);
      interaction.reply({
        content: "Annoying " + user.username,
        ephemeral: true,
      });
      break;
    case "fight":
      user = interaction.options.getUser("user");
      fight(interaction, interaction.user, user);
      break;
    case "kick":
      user = interaction.options.getUser("user");
      kick(interaction, user.id);
      break;
    case "ban":
      user = interaction.options.getUser("user");
      ban(interaction, user.id);
      break;
    case "unban":
      const id = interaction.options.getString("id");
      unban(interaction, parseInt(id));
      break;
    default:
      await interaction.reply("Invalid command");
  }
});

client.login(process.env.DISCORD_TOKEN);
