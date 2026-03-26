const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, embed } = require('../../utils/helpers');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('Backup server settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const guild = interaction.guild;
    const backup = {
      name: guild.name,
      icon: guild.iconURL(),
      settings: {},
      roles: [],
      channels: [],
      timestamp: new Date().toISOString(),
    };

    // Save settings
    const settings = db.db.prepare('SELECT * FROM settings WHERE guild_id = ?').all(guild.id);
    for (const s of settings) backup.settings[s.key] = s.value;

    // Save roles
    for (const [, role] of guild.roles.cache) {
      if (role.managed || role.id === guild.id) continue;
      backup.roles.push({ name: role.name, color: role.color, permissions: role.permissions.bitfield.toString(), position: role.position });
    }

    // Save channels
    for (const [, channel] of guild.channels.cache) {
      backup.channels.push({ name: channel.name, type: channel.type, position: channel.position, parent: channel.parentId });
    }

    const backupDir = path.join(__dirname, '..', '..', 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    const fileName = `backup-${guild.id}-${Date.now()}.json`;
    fs.writeFileSync(path.join(backupDir, fileName), JSON.stringify(backup, null, 2));

    await interaction.editReply({ embeds: [successEmbed(`Backup created: \`${fileName}\`\n**Roles:** ${backup.roles.length}\n**Channels:** ${backup.channels.length}`)] });
  },
};
