const { scheduleJob } = require("node-schedule");
const {get} = require("axios");
const {EmbedBuilder} = require("discord.js");
module.exports = (instance, client) => {
  scheduleJob('*/10 * * * *', async () => {
    const response = await get(process.env.MARKET_API);
    const coinData = response.data.filter((coin) => {
      return client.trackedCoins.find((row) => row.coin_id === coin.id);
    });

    const coins = coinData.map((coin) => {
      return {
        name: coin.name,
        value: `$${coin.current_price}`,
        inline: true,
      }
    })

    if (coins.length !== 0) {
      const embed = new EmbedBuilder()
        .setTitle('Tracked Coins')
        .setColor('#0099ff')
        .addFields(coins);

      await client.trackingChannel.send({embeds: [embed]});
    }
  });
}