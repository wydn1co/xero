const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setadminrole')
    .setDescription('Set the admin role')
    .addRoleOption(o => o.setName('role').setDescription('Admin role').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    db.set(interaction.guild.id, 'admin_role', role.id);
    await interaction.reply({ embeds: [successEmbed(`Admin role set to **${role.name}**.`)] });
  },
};
