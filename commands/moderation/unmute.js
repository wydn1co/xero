const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove timeout (unmute) from a user')
    .addUserOption(o => o.setName('user').setDescription('User to unmute').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });
    try {
      await member.timeout(null);
      db.addCase(interaction.guild.id, user.id, interaction.user.id, 'UNMUTE', 'Unmuted');
      await interaction.reply({ embeds: [successEmbed(`**${user.tag}** has been unmuted.`)] });
      await logAction(interaction.guild, modEmbed('🔊 User Unmuted', `**User:** ${user.tag}\n**Moderator:** ${interaction.user.tag}`));
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to unmute user.')], ephemeral: true }); }
  },
};
