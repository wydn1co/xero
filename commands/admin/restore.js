const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed } = require('../../utils/helpers');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restore')
    .setDescription('Restore server settings from a backup')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    if (!fs.existsSync(backupDir)) return interaction.reply({ embeds: [errorEmbed('No backups found.')], ephemeral: true });

    const files = fs.readdirSync(backupDir).filter(f => f.startsWith(`backup-${interaction.guild.id}`)).sort().reverse();
    if (files.length === 0) return interaction.reply({ embeds: [errorEmbed('No backups found for this server.')], ephemeral: true });

    const latestFile = files[0];
    const backup = JSON.parse(fs.readFileSync(path.join(backupDir, latestFile), 'utf8'));

    // Restore settings
    for (const [key, value] of Object.entries(backup.settings)) {
      db.set(interaction.guild.id, key, value);
    }

    await interaction.reply({ embeds: [successEmbed(`Restored settings from \`${latestFile}\`.\n**Settings restored:** ${Object.keys(backup.settings).length}\n*Note: Roles and channels are preserved in backup but not auto-recreated to avoid conflicts.*`)] });
  },
};
