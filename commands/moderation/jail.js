const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jail')
    .setDescription('Restrict a user to the jail channel')
    .addUserOption(o => o.setName('user').setDescription('User to jail').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });

    const jailRoleId = db.get(interaction.guild.id, 'jail_role');
    if (!jailRoleId) return interaction.reply({ embeds: [errorEmbed('Jail not set up. Run `/setup` first.')], ephemeral: true });

    // Save current roles
    const currentRoles = member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.id);
    db.addJail(interaction.guild.id, user.id, currentRoles);

    try {
      await member.roles.set([jailRoleId]);
      db.addCase(interaction.guild.id, user.id, interaction.user.id, 'JAIL', 'Jailed');
      await interaction.reply({ embeds: [successEmbed(`**${user.tag}** has been jailed.`)] });
      await logAction(interaction.guild, modEmbed('🔒 User Jailed', `**User:** ${user.tag}\n**Moderator:** ${interaction.user.tag}`));
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to jail user.')], ephemeral: true }); }
  },
};
