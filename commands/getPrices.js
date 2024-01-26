const {CommandType} = require("wokcommands");
const {get} = require("axios");
const {EmbedBuilder} = require("discord.js");

module.exports = {
  type: CommandType.SLASH,
  description: "Get the prices of tracked coins",
  deferReply: true,
  callback: async ({ client }) => {
    const coins = await get(process.env.DB_API + '/tracked').then((response) => response.data);
    const response = await get(process.env.CRYPTO_API);
    const coinData = response.data.filter((coin) => {
      return coins.find((row) => row.coin_id === coin.id);
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


    return {
      embeds: [embed],
    }
  },
}