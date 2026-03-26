const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('auditlog')
    .setDescription('Show recent audit log entries')
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog),
  async execute(interaction) {
    try {
      const logs = await interaction.guild.fetchAuditLogs({ limit: 10 });
      const entries = logs.entries.map(entry =>
        `**${entry.action}** — ${entry.executor?.tag || 'Unknown'}\n> Target: ${entry.target?.tag || entry.target?.name || 'N/A'} • <t:${Math.floor(entry.createdTimestamp / 1000)}:R>`
      ).join('\n\n');
      await interaction.reply({ embeds: [embed('info').setTitle('📋 Audit Log').setDescription(entries || 'No entries found.')] });
    } catch (e) {
      await interaction.reply({ content: 'Failed to fetch audit logs.', ephemeral: true });
    }
  },
};
