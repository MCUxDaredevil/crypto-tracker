const {CommandType} = require("wokcommands");
const {get, post} = require("axios");
const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

module.exports = {
  description: "Reset the Database",
  deferReply: "ephemeral",
  ownerOnly: true,
  testOnly: true,
  guildOnly: true,
  type: CommandType.SLASH,
  callback: async (
    {client, interaction, user}
  ) => {
    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('⚠️ Confirm')
      .setStyle(ButtonStyle.Danger);

    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(cancel, confirm);

    const response = await interaction.editReply({
      content: 'Are you sure you want to reset the DB?',
      components: [row],
    });

    const collectorFilter = i => i.user.id === user.id;
    try {
      const confirmation = await response.awaitMessageComponent({filter: collectorFilter, time: 10_000});

      if (confirmation.customId === 'confirm') {
        await post(process.env.DB_API + '/query', {
          query: "DELETE FROM coins",
          params: [],
        });
        const response = await get(process.env.CRYPTO_API);
        const coins = response.data.map((coin) => {
          return `(
            '${coin.id}',
            '${coin.name}',
            '${coin.symbol}',
            '${coin.image}',
            0
        )`;
        });
        const query = `INSERT INTO coins (
            coin_id, name, symbol, image, tracking
        )
        VALUES ${coins.join(', ')}`;

        await post(process.env.DB_API + '/query', {
          query,
          params: [],
        });
        client.trackedCoins = [];

        await confirmation.update({
          content: `Done Resetting`,
          components: []
        });
      } else if (confirmation.customId === 'cancel') {
        await confirmation.update({content: 'Reset cancelled', components: []});
      }
    } catch (e) {
      await interaction.editReply({content: 'Confirmation not received within 1 minute, cancelling', components: []});
      console.error(e);
    }
  },
}