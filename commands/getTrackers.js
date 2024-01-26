const { CommandType } = require("wokcommands");
const {post, get} = require("axios");

module.exports = {
    type: CommandType.SLASH,
    description: "Get a list of all the coins you are tracking",
    callback: async ({
        client
    }) => {
      const coins = await get(process.env.DB_API + '/tracked').then((response) => response.data);
      return {
        content: coins.map((row) => `${row.name} (${row.coin_id})`).join("\n"),
      }
    },
}