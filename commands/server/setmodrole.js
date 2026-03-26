const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setmodrole')
    .setDescription('Set the moderator role')
    .addRoleOption(o => o.setName('role').setDescription('Mod role').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    db.set(interaction.guild.id, 'mod_role', role.id);
    await interaction.reply({ embeds: [successEmbed(`Moderator role set to **${role.name}**.`)] });
  },
};
