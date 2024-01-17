const {CommandType} = require("wokcommands");
const {ApplicationCommandOptionType, ComponentType, StringSelectMenuBuilder, ActionRowBuilder} = require("discord.js");
const {get} = require("axios");

module.exports = {
  type: CommandType.SLASH,
  description: "Place bets for the crypto prices",
  deferReply: true,
  callback: async ({
                     client,
                     instance,
                     message,
                     interaction,
                     args,
                     text,
                     guild,
                     member,
                     user,
                     channel,
                   }) => {
    const coinMenu = new StringSelectMenuBuilder({
      custom_id: 'coin_menu',
      placeholder: 'Select the coin',
      options: client.trackedCoins.map((coin) => {
        return {
          label: `${coin.name} (${coin.coin_id})`,
          value: coin.coin_id,
        };
      }),
    });

    const row = new ActionRowBuilder().addComponents(coinMenu);
    const response = await interaction.editReply({
      content: 'Select a coin',
      components: [row],
    });

    const menuCollector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 600_000,
    });

    menuCollector.on('collect', async (menuInteraction) => {
      const coinId = menuInteraction.values[0];
      const coin = client.trackedCoins.find((coin) => coin.coin_id === coinId);

      menuInteraction.update({
        content: `How much do you want to bet on it?`,
        components: [],
      });

      const priceCollector = menuInteraction.channel.createMessageCollector({
        filter: (m) => m.author.id === user.id,
        time: 300_000,
      });

      priceCollector.on('collect', async m => {
        const price = parseFloat(m.content);

        await menuInteraction.editReply({
          content: `${user.username} bet ${price} on ${coin.name}`,
          components: [],
        });
      });

      priceCollector.on('end', async (collected) => {
        await menuInteraction.editReply({
            content: 'Timed out',
            components: [],
          });
      });
    });

    menuCollector.on('end', async (collected) => {
      await response.editReply({
        content: 'Timed out',
        components: [],
      });
    });
  },
}