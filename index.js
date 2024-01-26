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
  client.trackingChannel = await client.channels.fetch("1195128453092081785");
  client.trackedCoins = await get(process.env.DB_API + '/tracked').then((response) => response.data);

  new WOK({
    client,
    commandsDir: path.join(__dirname, "commands"),
    testServers: ["759539934557110272"],
    botOwners: ["561431845644926976"],
  });

  console.log(`Logged in as ${client.user.tag}!`);

  schedule.scheduleJob('*/10 * * * *', async () => {
    const response = await get(process.env.CRYPTO_API);
    const coinData = response.data.filter((coin) => {
      return client.trackedCoins.find((row) => row.coin_id === coin.id);
    });

    const embed = new EmbedBuilder()
      .setTitle('Tracked Coins')
      .setColor('#0099ff')
      .addFields(
        coinData.map((coin) => {
          return {
            name: coin.name,
            value: `$${coin.current_price}`,
            inline: true,
          }
        })
      );

    await client.trackingChannel.send({embeds: [embed]});

  });

});

client.login(process.env.BOT_TOKEN);