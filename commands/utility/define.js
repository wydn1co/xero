const { SlashCommandBuilder } = require('discord.js');
const { embed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('Look up a word definition')
    .addStringOption(o => o.setName('word').setDescription('Word to define').setRequired(true)),
  async execute(interaction) {
    const word = interaction.options.getString('word');
    try {
      const fetch = require('node-fetch');
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      const entry = data[0];
      const meanings = entry.meanings.slice(0, 3).map(m => {
        const def = m.definitions[0];
        return `**${m.partOfSpeech}**: ${def.definition}${def.example ? `\n> _"${def.example}"_` : ''}`;
      }).join('\n\n');
      const e = embed('info')
        .setTitle(`📖 ${entry.word}`)
        .setDescription(meanings);
      if (entry.phonetic) e.setFooter({ text: `Phonetic: ${entry.phonetic}` });
      await interaction.reply({ embeds: [e] });
    } catch (e) {
      await interaction.reply({ embeds: [errorEmbed(`No definition found for "${word}".`)], ephemeral: true });
    }
  },
};
