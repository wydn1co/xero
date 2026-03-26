const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voiceunmute')
    .setDescription('Remove voice mute from a user')
    .addUserOption(o => o.setName('user').setDescription('User to voice unmute').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });
    if (!member.voice.channel) return interaction.reply({ embeds: [errorEmbed('User is not in a voice channel.')], ephemeral: true });
    try {
      await member.voice.setMute(false);
      db.addCase(interaction.guild.id, user.id, interaction.user.id, 'VOICEUNMUTE', 'Unmuted');
      await interaction.reply({ embeds: [successEmbed(`**${user.tag}** has been voice unmuted.`)] });
      await logAction(interaction.guild, modEmbed('🔊 Voice Unmuted', `**User:** ${user.tag}\n**Moderator:** ${interaction.user.tag}`));
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to voice unmute user.')], ephemeral: true }); }
  },
};
