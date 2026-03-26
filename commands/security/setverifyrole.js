const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setverifyrole')
    .setDescription('Set the role given upon verification')
    .addRoleOption(o => o.setName('role').setDescription('Verified role').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    db.set(interaction.guild.id, 'verify_role', role.id);
    await interaction.reply({ embeds: [successEmbed(`Verified role set to **${role.name}**.`)] });
  },
};
