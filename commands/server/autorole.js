const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Set a role to automatically assign on join')
    .addRoleOption(o => o.setName('role').setDescription('Auto-assign role').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    db.set(interaction.guild.id, 'auto_role', role.id);
    await interaction.reply({ embeds: [successEmbed(`Auto-role set to **${role.name}**. New members will receive this role.`)] });
  },
};
