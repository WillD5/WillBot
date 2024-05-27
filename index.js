import dotenv from "dotenv";
dotenv.config();

import {
  Client,
  REST,
  Routes,
  GatewayIntentBits,
  PermissionsBitField,
  ActivityType,
  EmbedBuilder,
} from "discord.js";

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
];

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
        name: "!rps",
        value: "Play rock paper scissors with a highly advanced AI opponent.",
      },
      {
        name: "!rng",
        value: "Generate a random number going from 1 to 100!",
      },
      { name: "!help", value: "Shows this command!" },
      {
        name: "!purge",
        value: "Used to delete messages in bulk. (Mod+)",
      },
      {
        name: "!annoy",
        value: "Pings a user 10 times, then deletes the messages. (Admin+)",
      }
    );
  message.channel.send({ embeds: [embed] });
}

function purge(message, number) {
  if (
    message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
  ) {
    message.channel.bulkDelete(number);
  } else {
    message.channel.send(":x: Insufficient Permissions");
  }
}

function annoy(message, query, threshold = annoyThreshold) {
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    for (let i = 0; i < annoyThreshold; i++) {
      message.channel.send(query);
    }
    setTimeout(() => {
      message.channel.bulkDelete(threshold);
    }, 6300);
  } else {
    message.reply("You do not have permission to use this command.");
  }
}
function rockpaperscissors(message, userChoice) {
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

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [
      {
        name: `Tornadic Studios' Comeback`,
        type: ActivityType.Watching,
        state: "Run /help to see my commands!",
      },
    ],
    status: "dnd",
  });
  setCommands();
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
    case "rps":
      rockpaperscissors(message, args[1]);
      break;
    case "rng":
      message.reply(Math.floor(Math.random() * 100).toString());
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
    default:
      message.reply("Invalid command");
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case "ping":
      await interaction.reply("Pong!");
      break;
    case "hello":
      await interaction.reply("Hello!");
      break;
    case "help":
      help(interaction);
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
      const user = interaction.options.getUser("user");
      let query = "<@" + user.id + ">";
      annoy(interaction, query);
      interaction.reply({
        content: "Annoying " + user.username,
        ephemeral: true,
      });
      break;
    default:
      await interaction.reply("Invalid command");
  }
});

client.login(process.env.DISCORD_TOKEN);
