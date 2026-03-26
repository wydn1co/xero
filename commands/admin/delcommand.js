const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delcommand')
    .setDescription('Delete a custom command')
    .addStringOption(o => o.setName('name').setDescription('Command name').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const name = interaction.options.getString('name').toLowerCase();
    const result = db.deleteCustomCommand(interaction.guild.id, name);
    if (result.changes === 0) return interaction.reply({ embeds: [errorEmbed('Command not found.')], ephemeral: true });
    await interaction.reply({ embeds: [successEmbed(`Custom command **${name}** deleted.`)] });
  },
};
