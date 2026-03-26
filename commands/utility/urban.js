const { SlashCommandBuilder } = require('discord.js');
const { embed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('urban')
    .setDescription('Look up a word on Urban Dictionary')
    .addStringOption(o => o.setName('word').setDescription('Word to look up').setRequired(true)),
  async execute(interaction) {
    const word = interaction.options.getString('word');
    try {
      const fetch = require('node-fetch');
      const res = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`);
      const data = await res.json();
      if (!data.list || data.list.length === 0) throw new Error('Not found');
      const entry = data.list[0];
      const definition = entry.definition.replace(/\[|\]/g, '').slice(0, 1024);
      const example = entry.example ? entry.example.replace(/\[|\]/g, '').slice(0, 512) : null;
      const e = embed('info')
        .setTitle(`📗 ${entry.word}`)
        .setDescription(definition)
        .setFooter({ text: `👍 ${entry.thumbs_up} | 👎 ${entry.thumbs_down}` });
      if (example) e.addFields({ name: 'Example', value: `_${example}_` });
      await interaction.reply({ embeds: [e] });
    } catch (e) {
      await interaction.reply({ embeds: [errorEmbed(`No results found for "${word}".`)], ephemeral: true });
    }
  },
};
