const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database');

const COLORS = {
  success: 0x2ecc71,
  error: 0xe74c3c,
  warn: 0xf39c12,
  info: 0x3498db,
  mod: 0xe67e22,
  purple: 0x9b59b6,
};

function embed(color = 'info') {
  return new EmbedBuilder().setColor(COLORS[color] || COLORS.info).setTimestamp();
}

function successEmbed(description) {
  return embed('success').setDescription(`✅ ${description}`);
}

function errorEmbed(description) {
  return embed('error').setDescription(`❌ ${description}`);
}

function warnEmbed(description) {
  return embed('warn').setDescription(`⚠️ ${description}`);
}

function infoEmbed(description) {
  return embed('info').setDescription(description);
}

function modEmbed(title, description) {
  return embed('mod').setTitle(title).setDescription(description);
}

function checkPermission(interaction, permission) {
  if (!interaction.member.permissions.has(permission)) {
    interaction.reply({ embeds: [errorEmbed('You do not have permission to use this command.')], ephemeral: true });
    return false;
  }
  return true;
}

function checkModRole(interaction) {
  const modRoleId = db.get(interaction.guild.id, 'mod_role');
  const adminRoleId = db.get(interaction.guild.id, 'admin_role');
  const hasModRole = modRoleId && interaction.member.roles.cache.has(modRoleId);
  const hasAdminRole = adminRoleId && interaction.member.roles.cache.has(adminRoleId);
  const hasPerms = interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);
  if (!hasModRole && !hasAdminRole && !hasPerms) {
    interaction.reply({ embeds: [errorEmbed('You need a moderator or admin role to use this command.')], ephemeral: true });
    return false;
  }
  return true;
}

function checkAdminRole(interaction) {
  const adminRoleId = db.get(interaction.guild.id, 'admin_role');
  const hasAdminRole = adminRoleId && interaction.member.roles.cache.has(adminRoleId);
  const hasPerms = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
  if (!hasAdminRole && !hasPerms) {
    interaction.reply({ embeds: [errorEmbed('You need an admin role to use this command.')], ephemeral: true });
    return false;
  }
  return true;
}

async function logAction(guild, embed) {
  const logChannelId = db.get(guild.id, 'log_channel');
  if (!logChannelId) return;
  try {
    const channel = await guild.channels.fetch(logChannelId);
    if (channel) await channel.send({ embeds: [embed] });
  } catch (e) { /* channel may be deleted */ }
}

module.exports = {
  COLORS, embed, successEmbed, errorEmbed, warnEmbed, infoEmbed, modEmbed,
  checkPermission, checkModRole, checkAdminRole, logAction,
};
