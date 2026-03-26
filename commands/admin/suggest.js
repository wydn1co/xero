const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Suggest a feature')
    .addStringOption(o => o.setName('idea').setDescription('Your suggestion').setRequired(true)),
  async execute(interaction) {
    const idea = interaction.options.getString('idea');
    await logAction(interaction.guild, modEmbed('💡 Suggestion', `**From:** ${interaction.user.tag}\n**Idea:** ${idea}`));
    await interaction.reply({ embeds: [successEmbed('Suggestion submitted! Thank you.')], ephemeral: true });
  },
};
