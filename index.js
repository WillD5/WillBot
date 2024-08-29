/**
 * A general purpose discord bot, currently used for fun and moderation mainly.
 * Credits to bluejer1 for the original code.
 */

import { Client, GatewayIntentBits, ActivityType } from "discord.js";

import {
  help,
  auso,
  rps,
  eightball,
  rng,
  membercount,
  diceroll,
  purge,
  fight,
  kick,
  ban,
  unban,
  annoy,
} from "./methods.js";

import { setCommands } from "./commands.js";

const prefix = "!";
const annoyThreshold = 10;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

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
    client.channels.cache
      .get(process.env.STATUS_CHANNEL_ID)
      .send("i have awoken");
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
      rps(message, args[1]);
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
      purge(message, args[1], client, false);
      break;
    case "annoy":
      annoy(message, args[1], annoyThreshold + 1);
      break;
    case "fight":
      fight(message, message.author, message.mentions.users.first());
      break;
    case "kick":
      kick(message, args[1], args[2], client);
      break;
    case "ban":
      ban(message, args[1], args[2], client);
      break;
    case "unban":
      unban(message, args[1], args[2], client);
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
      rps(interaction, interaction.options.getString("choice"));
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
      purge(interaction, number, client, true);
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
      kick(interaction, user.id, client);
      break;
    case "ban":
      user = interaction.options.getUser("user");
      ban(interaction, user.id, client);
      break;
    case "unban":
      const id = interaction.options.getString("id");
      unban(interaction, parseInt(id), client);
      break;
    default:
      await interaction.reply("Invalid command");
  }
});

client.login(process.env.DISCORD_TOKEN);
