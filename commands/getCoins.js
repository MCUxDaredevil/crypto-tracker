const {CommandType} = require("wokcommands");
const {EmbedBuilder} = require("discord.js");
const {get} = require("axios");

module.exports = {
  description: "Get all available coins",
  type: CommandType.BOTH,

  // Invoked when a user runs the ping command
  callback: async () => {
    const res = await get(process.env.CRYPTO_API)
    const coins = res.data;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Available Coins')
      .setDescription('Sorted by market cap rank');

    const groupedCoins = coins.reduce((acc, coin, index) => {
      const groupIndex = Math.floor(index / 10);
      acc[groupIndex] = acc[groupIndex] || [];
      acc[groupIndex].push(coin);
      return acc;
    }, []);

    groupedCoins.forEach((group, groupIndex) => {
      embed.addFields({
        name: `Group ${groupIndex + 1}`,
        value: group.map((coin, index) => `${groupIndex * 10 + index + 1}. ${coin.name}`).join('\n'),
        inline: true,
      });
    });

    return {
      embeds: [embed]
    }
  },
}