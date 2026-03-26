const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bugreport')
    .setDescription('Report a bug with the bot')
    .addStringOption(o => o.setName('description').setDescription('Describe the bug').setRequired(true)),
  async execute(interaction) {
    const description = interaction.options.getString('description');
    await logAction(interaction.guild, modEmbed('🐛 Bug Report', `**Reporter:** ${interaction.user.tag}\n**Description:** ${description}`));
    await interaction.reply({ embeds: [successEmbed('Bug report submitted! Thank you.')], ephemeral: true });
  },
};
