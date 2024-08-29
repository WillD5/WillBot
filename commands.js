import {
  REST,
  Routes,
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

export async function setCommands() {
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
