const {scheduleJob} = require("node-schedule");
const axios = require("axios");
const {EmbedBuilder} = require("discord.js");

module.exports = (instance, client) => {
  scheduleJob('* */12 * * *', async () => {
    const {data: coins} = await axios.post(process.env.DB_API + '/query', {
      query: "SELECT DISTINCT coin_id FROM bets WHERE future=0",
    });

    const embed = new EmbedBuilder()
        .setTitle('Leaderboard')
        .setColor('#0099ff')
        .setTimestamp()

    for (const {coin_id: coin} of coins) {
      const {data: prices} = await axios.get(process.env.MARKET_API);
      const {current_price: price} = prices.find(c => c.id === coin);

      const users = await axios.post(process.env.DB_API + "/query", {
        query: `SELECT * FROM bets WHERE coin_id="${coin}" AND future=0`
      }).then(response => response.data.map(user => {
        return {
          ...user,
          difference: Math.abs(user.amount - price)
        }
      }));

      const leaderboard = new Map();
      users.sort((a, b) => a.difference - b.difference || a.bet_id - b.bet_id).slice(0, 3).forEach(
        (user, index) => leaderboard.set(user.user_id, 5 - (2 * index))
      );

      let scoreText = "";
      for (const [user_id, points] of leaderboard) {
        await axios.post(process.env.DB_API + "/query", {
          query: `UPDATE users SET points=points+${points} WHERE user_id="${user_id}"`
        });
        scoreText += `#${(7-points)/2}. <@${user_id}>\n`
      }

      const coin_name = prices.find(c => c.id === coin).name;

      embed.addFields([{
          name: coin_name,
          value: scoreText,
          inline: true
      }])

      await axios.post(process.env.DB_API + "/query", {
        query: `DELETE FROM bets WHERE coin_id="${coin}" AND future=0`
      });

      await axios.post(process.env.DB_API + "/query", {
        query: `UPDATE bets SET future=0 WHERE coin_id="${coin}"`
      });

    }

    client.channels.fetch(process.env.LEADERBOARD_CHANNEL).then(channel => {
        channel.send({embeds: [embed]})
      })

  });
}