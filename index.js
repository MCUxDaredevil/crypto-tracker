const {Client, GatewayIntentBits, EmbedBuilder} = require("discord.js");
const axios = require("axios");
const SQLManager = require("./db");
require('dotenv').config();

const {parseRange} = require("./utils");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers,]
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.db = new SQLManager({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
});

client.on("messageCreate", async (message) => {


  if (message.content === "!getTrackers") {
    const coins = await client.db.executeQuery("SELECT coin_id, name FROM coins WHERE tracking=1");
    await message.reply(coins.map((coin) => coin.name).toString());
  }

  if (message.content.startsWith("!track")) {
    const ranges = message.content.slice(6);
    if (!ranges) {
      return await message.reply("Please provide a range of coin IDs to track.");
    }

    const ranks = parseRange(ranges);
    if (ranks.length === 0) {
      return await message.reply("Please provide a valid range of coin IDs to track.");
    }

    axios.get(process.env.API_URL).then(async (res) => {
      const coins = res.data;

      let selectedCoins = [];
      ranks.forEach((rank) => {
        const coin = coins[rank - 1];
        selectedCoins.push(`${coin.market_cap_rank}. ${coin.name}(${coin.id})`);
      });

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Selected Coins')
        .setDescription(selectedCoins.join('\n'));

      await message.reply({embeds: [embed]});
    });
  }
});

client.login(process.env.BOT_TOKEN);