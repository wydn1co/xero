const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a user')
    .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for warning').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    db.addWarning(interaction.guild.id, user.id, interaction.user.id, reason);
    db.addCase(interaction.guild.id, user.id, interaction.user.id, 'WARN', reason);
    const warns = db.getWarnings(interaction.guild.id, user.id);
    await interaction.reply({ embeds: [successEmbed(`**${user.tag}** has been warned.\n**Reason:** ${reason}\n**Total Warnings:** ${warns.length}`)] });
    await logAction(interaction.guild, modEmbed('⚠️ User Warned', `**User:** ${user.tag}\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}\n**Total:** ${warns.length}`));
  },
};
