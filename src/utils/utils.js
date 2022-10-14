const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

async function embedPages(client, interaction, embeds) {
  const pages = {};
  const getRow = (id) => {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("◀")
        .setCustomId("prev_embed")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pages[id] === 0),

      new ButtonBuilder()
        .setLabel("▶")
        .setCustomId("next_embed")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pages[id] === embeds.length - 1)
    );
    return row;
  };

  const id = interaction.user.id;
  pages[id] = pages[id] || 0;
  let Pagemax = embeds.length;

  const embed = embeds[pages[id]];

  await embeds[pages[id]].setFooter({
    text: `Page ${pages[id] + 1} from ${Pagemax}`,
  });

  const replyEmbed = await interaction.editReply({
    embeds: [embed],
    components: [getRow(id)],
    fetchReply: true,
  });

  const filter = (i) => i.user.id === interaction.user.id;
  const time = 1000 * 60 * 5;

  const collector = await replyEmbed.createMessageComponentCollector({
    filter,
    time,
  });

  collector.on("collect", async (b) => {
    if (!b) return;
    if (b.customId !== "prev_embed" && b.customId !== "next_embed") return;

    b.deferUpdate();

    if (b.customId === "prev_embed" && pages[id] > 0) {
      --pages[id];
    } else if (b.customId === "next_embed" && pages[id] < embeds.length - 1) {
      ++pages[id];
    }

    await embeds[pages[id]].setFooter({
      text: `Page ${pages[id] + 1} of ${Pagemax}`,
    });

    await interaction.editReply({
      embeds: [embeds[pages[id]]],
      components: [getRow(id)],
      fetchReply: true,
    });
  });
}

module.exports = {
  embedPages,
};
