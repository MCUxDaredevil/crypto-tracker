const {CommandType} = require("wokcommands");
const {parseRange} = require("../utils");
const axios = require("axios");
const {EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType, ButtonStyle, ButtonBuilder} = require("discord.js");

module.exports = {
  type: CommandType.BOTH,
  init: (client, instance) => {
  },
  description: "Add your description here",
  aliases: [],
  testOnly: false,
  guildOnly: false,
  ownerOnly: false,
  permissions: [],
  deferReply: 'ephemeral',
  minArgs: 0,
  maxArgs: -1,
  correctSyntax: "Correct syntax: {PREFIX}{COMMAND} {ARGS}",
  expectedArgs: "<num1> <num2>",
  options: [],
  reply: true,
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
                     cancelCooldown,
                     updateCooldown,
                   }) => {

    const coins = (await axios.get(process.env.API_URL)).data.map((coin) => {
      return {
        id: coin.id,
        name: coin.name,
      };
    });

    const rows = await client.db.executeQuery("SELECT coin_id, name FROM coins WHERE tracking=1")
    const trackedCoins = rows.map((coin) => {
      return {
        id: coin.coin_id,
        name: coin.name,
      };
    });

    let currentPage = 1;
    const maxPage = Math.ceil(coins.length / 25);
    const currentCoins = coins.slice((currentPage - 1) * 25, currentPage * 25);

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
      time: 3_600_000,
    })

    const buttonCollector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 3_600_000,
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

      const currentCoins = coins.slice((currentPage - 1) * 25, currentPage * 25);
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
      const selection = i.values;
      const deselected = trackedCoins.filter((coin_id) => currentCoins.has(coin_id) && !selection.has(coin_id));
      const selectQuery = `UPDATE coins SET tracking=1 WHERE coin_id IN (${selection.map((id) => `'${id}'`).join(', ')})`;
      const deselectQuery = `UPDATE coins SET tracking=0 WHERE coin_id IN (${deselected.map((id) => `'${id}'`).join(', ')})`;
      await client.db.executeQuery(selectQuery);
      await client.db.executeQuery(deselectQuery);
      await i.reply({
        content: "Added the following coins to tracking: " + selection.join(', ')
      })
    });


    if (message) {
      const ranges = message.content.slice(6);
      if (!ranges) {
        return await message.reply("Please provide a range of coin IDs to track.");
      }

      const ranks = parseRange(ranges);
      if (ranks.length === 0) {
        return await message.reply("Please provide a valid range of coin IDs to track.");
      }

      axios.get(process.env.API_URL).then(async (res) => {
        const coins = res.data;

        let selectedCoins = [];
        ranks.forEach((rank) => {
          const coin = coins[rank - 1];
          selectedCoins.push(`${coin.market_cap_rank}. ${coin.name}(${coin.id})`);
        });

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Selected Coins')
          .setDescription(selectedCoins.join('\n'));

        await message.reply({embeds: [embed]});
      });
    }

  },
}