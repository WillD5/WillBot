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

function isNumeric(value) {
  return /^-?\d+$/.test(value);
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
const updatesChannelId = "1244730880551944192";

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
        name: "!rng",
        value: "Generate a random number going from 1 to 100!",
      },
      { name: "!help", value: "Shows this command!" }
    );
  return { embeds: [embed] };
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
      })
      .catch(() => {
        message.reply(
          ":x: | An error has occured, contact the Bot Maintainer."
        );
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
    const id = user.user.id;
    if (user.permissions.has(PermissionsBitField.Flags.Administrator)) {
      message.reply(":x: I cannot ban this user!");
      return;
    }
    message.guild.members
      .ban(id, { reason: reason })
      .then(() => {
        message.reply(
          ":white_check_mark: | " +
            user.user.username +
            " has been successfully banned."
        );
      })
      .catch(() => {
        message.reply(
          ":x: | An error has occured, contact the Bot Maintainer."
        );
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
      .then((e) => {
        if (e) {
          message.reply(
            ":x: | An error has occured, contact the Bot Maintainer."
          );
          return;
        }
        message.channel.send(
          ":white_check_mark: | user has been successfully unbanned."
        );
      })
      .catch(() => {
        message.reply(":x: | User is not banned.");
      });
  }
}

function annoy(message, query, threshold = annoyThreshold) {
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    if (!query) {
      message.reply("You need to specify a user to annoy!");
      return;
    }
    for (let i = 0; i < annoyThreshold; i++) {
      message.channel.send(query);
    }
    setTimeout(() => {
      message.channel.bulkDelete(threshold);
    }, 6500);
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
    "I don't care",
    "I don't think so",
    "I think so",
  ];
  message.reply(responses[Math.floor(Math.random() * responses.length)]);
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
      message.channel.send(help());
      break;
    case "rps":
      RockPaperScissors(message, args[1]);
      break;
    case "8ball":
      eightball(message, args.join(" ").substring(6));
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
      interaction.reply(Math.floor(Math.random() * 100).toString());
      break;
    case "help":
      interaction.reply(help());
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
