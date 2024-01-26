const {CommandType} = require("wokcommands");
const {placeBet} = require("../utils");

module.exports = {
  type: CommandType.SLASH,
  description: "Place bets for the crypto prices",
  deferReply: true,
  testOnly: true,
  ownerOnly: true,
  guildOnly: true,
  callback: async ({client, interaction, user}) => {
    const response = await placeBet(user.id, 'ethereum', 100);

    if(response?.error) {
      return interaction.editReply({
        content: response.error,
      });
    }

    await interaction.editReply({
      content: 'Bet placed',
    });
  },
}