const { CommandType } = require("wokcommands");

module.exports = {
    type: CommandType.BOTH,
    description: "Get a list of all the coins you are tracking",
    maxArgs: 0,
    correctSyntax: "Correct syntax: {PREFIX}{COMMAND}",
    reply: true,
    callback: async ({
        client
    }) => {
      const coins = await client.db.executeQuery("SELECT coin_id, name FROM coins WHERE tracking=1");
      return {
        content: coins.map((coin) => coin.name).toString(),
      }
    },
}