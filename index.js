const {Client, IntentsBitField, Partials} = require("discord.js");
const WOK = require("wokcommands");
const path = require("path");
require("dotenv/config");
const SQLManager = require("./db");
const axios = require("axios");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.on("ready", () => {
  client.fetchApi = axios.get;
  new WOK({
    client,
    commandsDir: path.join(__dirname, "commands"),
    testServers: ["759539934557110272"],
    botOwners: ["561431845644926976"],
  });

  client.db = new SQLManager({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.BOT_TOKEN);