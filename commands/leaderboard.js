const {CommandType} = require("wokcommands");
const {EmbedBuilder} = require("discord.js");
const axios = require("axios");

module.exports = {
  type: CommandType.SLASH,
  description: "Check the global leaderboard",
  guildOnly: true,
  deferReply: true,
  callback: async () => {

    const embed = new EmbedBuilder()
      .setTitle('Global Leaderboard')
      .setColor('#0099ff')
      .setTimestamp()

    const {data: users} = await axios.post(process.env.DB_API + "/query", {
      query: `SELECT * FROM users ORDER BY points DESC LIMIT 10`
    });

    let scoreText = "";
    for (const [index, user] of users.entries()) {
      scoreText += `#${index + 1}. <@${user["user_id"]}> - ${user["points"]} points\n`
    }

    embed.setDescription(scoreText)

    return {
      embeds: [embed]
    }
  },
}