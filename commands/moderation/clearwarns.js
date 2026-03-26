const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Clear all warnings for a user')
    .addUserOption(o => o.setName('user').setDescription('User to clear').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    db.clearWarnings(interaction.guild.id, user.id);
    await interaction.reply({ embeds: [successEmbed(`All warnings cleared for **${user.tag}**.`)] });
    await logAction(interaction.guild, modEmbed('🧹 Warnings Cleared', `**User:** ${user.tag}\n**Moderator:** ${interaction.user.tag}`));
  },
};
