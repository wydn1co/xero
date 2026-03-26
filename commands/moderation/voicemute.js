const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicemute')
    .setDescription('Server-mute a user in voice')
    .addUserOption(o => o.setName('user').setDescription('User to voice mute').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });
    if (!member.voice.channel) return interaction.reply({ embeds: [errorEmbed('User is not in a voice channel.')], ephemeral: true });
    try {
      await member.voice.setMute(true, reason);
      db.addCase(interaction.guild.id, user.id, interaction.user.id, 'VOICEMUTE', reason);
      await interaction.reply({ embeds: [successEmbed(`**${user.tag}** has been voice muted.\n**Reason:** ${reason}`)] });
      await logAction(interaction.guild, modEmbed('🔇 Voice Muted', `**User:** ${user.tag}\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`));
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to voice mute user.')], ephemeral: true }); }
  },
};
