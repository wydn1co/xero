const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unjail')
    .setDescription('Release a user from jail')
    .addUserOption(o => o.setName('user').setDescription('User to unjail').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });

    const jailData = db.getJail(interaction.guild.id, user.id);
    if (!jailData) return interaction.reply({ embeds: [errorEmbed('This user is not jailed.')], ephemeral: true });

    try {
      const savedRoles = JSON.parse(jailData.roles);
      await member.roles.set(savedRoles);
      db.removeJail(interaction.guild.id, user.id);
      db.addCase(interaction.guild.id, user.id, interaction.user.id, 'UNJAIL', 'Released from jail');
      await interaction.reply({ embeds: [successEmbed(`**${user.tag}** has been released from jail.`)] });
      await logAction(interaction.guild, modEmbed('🔓 User Unjailed', `**User:** ${user.tag}\n**Moderator:** ${interaction.user.tag}`));
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to unjail user.')], ephemeral: true }); }
  },
};
