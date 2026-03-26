const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for kick'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [errorEmbed('User not found in this server.')], ephemeral: true });
    if (!member.kickable) return interaction.reply({ embeds: [errorEmbed('I cannot kick this user.')], ephemeral: true });
    try {
      await member.kick(reason);
      db.addCase(interaction.guild.id, user.id, interaction.user.id, 'KICK', reason);
      await interaction.reply({ embeds: [successEmbed(`**${user.tag}** has been kicked.\n**Reason:** ${reason}`)] });
      await logAction(interaction.guild, modEmbed('👢 User Kicked', `**User:** ${user.tag} (${user.id})\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`));
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to kick user.')], ephemeral: true }); }
  },
};
