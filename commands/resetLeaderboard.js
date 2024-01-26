const {CommandType} = require("wokcommands");
const {ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const {post} = require("axios");

module.exports = {
  type: CommandType.SLASH,
  description: "Reset the global leaderboard and set everyone's points to 0",
  guildOnly: true,
  ownerOnly: true,
  deferReply: true,
  callback: async ({interaction, user}) => {
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
      content: 'Are you sure you want to reset the points?',
      components: [row],
    });

    const collectorFilter = i => i.user.id === user.id;
    try {
      const confirmation = await response.awaitMessageComponent({filter: collectorFilter, time: 10_000});

      if (confirmation.customId === 'confirm') {
        await post(process.env.DB_API + '/query', {
          query: 'UPDATE users SET points = 0'
        });

        await confirmation.update({
          content: `Done resetting points`,
          components: []
        });
      } else if (confirmation.customId === 'cancel') {
        await confirmation.update({content: 'Reset cancelled', components: []});
      }
    } catch (e) {
      await interaction.editReply({content: 'Confirmation not received, cancelling', components: []});
      console.error(e);
    }
  },
}