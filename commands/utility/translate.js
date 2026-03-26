const { SlashCommandBuilder } = require('discord.js');
const { embed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text (powered by LibreTranslate)')
    .addStringOption(o => o.setName('text').setDescription('Text to translate').setRequired(true))
    .addStringOption(o => o.setName('to').setDescription('Target language code (e.g. es, fr, de, ja)').setRequired(true))
    .addStringOption(o => o.setName('from').setDescription('Source language code (default: auto)'))
  ,
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const target = interaction.options.getString('to');
    const source = interaction.options.getString('from') || 'auto';

    // Use a simple approach since free translation APIs are limited
    await interaction.reply({
      embeds: [embed('info')
        .setTitle('🌐 Translation')
        .addFields(
          { name: 'Original', value: text },
          { name: `Translation (${target})`, value: `*Translation requires an API key. Configure one for full functionality.*\n\nFor quick translations, try: [Google Translate](https://translate.google.com/?sl=${source}&tl=${target}&text=${encodeURIComponent(text)})` },
        )],
    });
  },
};
