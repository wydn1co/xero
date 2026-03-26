const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');
const db = require('../../database');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout (mute) a user')
    .addUserOption(o => o.setName('user').setDescription('User to mute').setRequired(true))
    .addStringOption(o => o.setName('time').setDescription('Duration (e.g. 10m, 1h, 1d)').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for mute'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const timeStr = interaction.options.getString('time');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const duration = ms(timeStr);
    if (!duration || duration > 28 * 24 * 60 * 60 * 1000) return interaction.reply({ embeds: [errorEmbed('Invalid duration. Max is 28 days.')], ephemeral: true });
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });
    if (!member.moderatable) return interaction.reply({ embeds: [errorEmbed('I cannot mute this user.')], ephemeral: true });
    try {
      await member.timeout(duration, reason);
      db.addCase(interaction.guild.id, user.id, interaction.user.id, 'MUTE', `${reason} (${timeStr})`);
      await interaction.reply({ embeds: [successEmbed(`**${user.tag}** has been muted for **${timeStr}**.\n**Reason:** ${reason}`)] });
      await logAction(interaction.guild, modEmbed('🔇 User Muted', `**User:** ${user.tag}\n**Duration:** ${timeStr}\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`));
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to mute user.')], ephemeral: true }); }
  },
};
