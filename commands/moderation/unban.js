const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user by their ID')
    .addStringOption(o => o.setName('userid').setDescription('User ID to unban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for unban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    try {
      await interaction.guild.members.unban(userId, reason);
      db.addCase(interaction.guild.id, userId, interaction.user.id, 'UNBAN', reason);
      await interaction.reply({ embeds: [successEmbed(`User \`${userId}\` has been unbanned.\n**Reason:** ${reason}`)] });
      await logAction(interaction.guild, modEmbed('🔓 User Unbanned', `**User ID:** ${userId}\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`));
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to unban. Make sure the ID is valid and the user is banned.')], ephemeral: true }); }
  },
};
