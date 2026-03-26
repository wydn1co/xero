const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Report a user to moderators')
    .addUserOption(o => o.setName('user').setDescription('User to report').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for report').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    await logAction(interaction.guild, modEmbed('🚨 User Report', `**Reported User:** ${user.tag} (${user.id})\n**Reporter:** ${interaction.user.tag}\n**Reason:** ${reason}`));
    await interaction.reply({ embeds: [successEmbed('Your report has been submitted to the moderators.')], ephemeral: true });
  },
};
