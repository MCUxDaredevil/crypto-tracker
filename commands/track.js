const {CommandType} = require("wokcommands");
const {get, post} = require("axios");
const {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
  ButtonStyle,
  ButtonBuilder
} = require("discord.js");

module.exports = {
  type: CommandType.SLASH,
  ownerOnly: true,
  description: "Manage the coins you are tracking",
  deferReply: 'ephemeral',
  callback: async ({
                     client,
                     interaction,
                   }) => {

    const coins = (await get(process.env.MARKET_API)).data.map((coin) => {
      return {
        id: coin.id,
        name: coin.name,
      };
    });

    const rows = await get(process.env.DB_API + '/tracked').then((response) => response.data);
    const trackedCoins = rows.map((coin) => {
      return {
        id: coin.coin_id,
        name: coin.name,
      };
    });

    let currentPage = 1;
    const maxPage = Math.ceil(coins.length / 25);
    let currentCoins = coins.slice((currentPage - 1) * 25, currentPage * 25);

    const coinMenu = new StringSelectMenuBuilder({
      custom_id: 'coin_menu',
      min_values: 0,
      max_values: 25,
      placeholder: 'Select the coins',
      options: currentCoins.map((coin) => {
        return {
          label: coin.name,
          value: coin.id,
          description: trackedCoins.find((trackedCoin) => trackedCoin.id === coin.id) ? 'Tracked' : 'Not tracked',
          default: !!trackedCoins.find((trackedCoin) => trackedCoin.id === coin.id),
        };
      }),
    });

    const previousButton = new ButtonBuilder({
      custom_id: 'previous_page',
      label: 'Previous',
      style: ButtonStyle.Primary,
    });

    const nextButton = new ButtonBuilder({
      custom_id: 'next_page',
      label: 'Next',
      style: ButtonStyle.Primary,
    });

    const pageLabel = new ButtonBuilder({
      custom_id: 'page_label',
      label: `${currentPage} / ${maxPage}`,
      style: ButtonStyle.Secondary,
      disabled: true,
    });


    const row1 = new ActionRowBuilder().addComponents(coinMenu);
    const row2 = new ActionRowBuilder().addComponents(previousButton, pageLabel, nextButton);

    const response = await interaction.editReply({
      content: 'Select coins to track',
      components: [row1, row2],
    });

    const menuCollector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 600_000,
    })

    const buttonCollector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 600_000,
    });

    buttonCollector.on('collect', async i => {
      if (i.customId === 'previous_page') {
        if (currentPage === 1) {
          return await i.reply({
            content: 'You are already on the first page',
            ephemeral: true,
          });
        }
        currentPage--;
      } else if (i.customId === 'next_page') {
        if (currentPage === maxPage) {
          return await i.reply({
            content: 'You are already on the last page',
            ephemeral: true,
          });
        }
        currentPage++;
      }

      currentCoins = coins.slice((currentPage - 1) * 25, currentPage * 25);
      coinMenu.setOptions(currentCoins.map((coin) => {
        return {
          label: coin.name,
          value: coin.id,
          description: trackedCoins.find((trackedCoin) => trackedCoin.id === coin.id) ? 'Tracked' : 'Not tracked',
          default: !!trackedCoins.find((trackedCoin) => trackedCoin.id === coin.id),
        };
      }));

      pageLabel.setLabel(`${currentPage} / ${maxPage}`);

      await i.update({
        components: [row1, row2],
      });
    });

    menuCollector.on('collect', async i => {
      const response = i.values;
      const deselected = currentCoins.filter((coin) =>
        trackedCoins.some((c) => c.id === coin.id) && !response.includes(coin.id)
      ).map((coin) => coin.id);

      const selection = response.filter((value) => !trackedCoins.some((coin) => coin.id === value));

      if (selection.length > 0) {
        const selectQuery = `UPDATE coins SET tracking=1 WHERE coin_id IN (${selection.map((id) => `'${id}'`).join(', ')})`;
        await post(process.env.DB_API + '/query', {
          query: selectQuery,
          params: [],
        });
      }

      if (deselected.length > 0) {
        const deselectQuery = `UPDATE coins SET tracking=0 WHERE coin_id IN (${deselected.map((id) => `'${id}'`).join(', ')})`;
        await post(process.env.DB_API + '/query', {
          query: deselectQuery,
          params: [],
        });
      }

      client.trackedCoins = await get(process.env.DB_API + '/tracked').then((response) => response.data);
      const reply = `Added the following coins to tracking: ${selection.join(', ') || "None"}\nRemoved the following coins from tracking: ${deselected.join(', ') || "None"}`;

      await i.reply({
        content: reply
      })
    });
  },
}