const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for ban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (member && !member.bannable) return interaction.reply({ embeds: [errorEmbed('I cannot ban this user. They may have higher permissions.')], ephemeral: true });
    try {
      await interaction.guild.members.ban(user.id, { reason, deleteMessageSeconds: 604800 });
      db.addCase(interaction.guild.id, user.id, interaction.user.id, 'BAN', reason);
      await interaction.reply({ embeds: [successEmbed(`**${user.tag}** has been banned.\n**Reason:** ${reason}`)] });
      await logAction(interaction.guild, modEmbed('🔨 User Banned', `**User:** ${user.tag} (${user.id})\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`));
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to ban user.')], ephemeral: true }); }
  },
};
