const {Client, IntentsBitField, Partials, EmbedBuilder} = require("discord.js");
const schedule = require("node-schedule");
const WOK = require("wokcommands");
const path = require("path");
require("dotenv/config");
const SQLManager = require("./db");
const {get} = require("axios");


const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.on("ready", async () => {
  client.trackingChannel = await client.channels.fetch(process.env.UPDATES_CHANNEL);
  client.trackedCoins = await get(process.env.DB_API + '/tracked').then((response) => response.data);

  new WOK({
    client,
    commandsDir: path.join(__dirname, "commands"),
    featuresDir: path.join(__dirname, "features"),
    testServers: ["759539934557110272"],
    botOwners: ["561431845644926976"],
  });

  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.BOT_TOKEN);