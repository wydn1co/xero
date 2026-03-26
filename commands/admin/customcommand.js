const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('customcommand')
    .setDescription('Create a custom command')
    .addStringOption(o => o.setName('name').setDescription('Command name').setRequired(true))
    .addStringOption(o => o.setName('response').setDescription('Response text').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const name = interaction.options.getString('name').toLowerCase();
    const response = interaction.options.getString('response');
    db.setCustomCommand(interaction.guild.id, name, response);
    await interaction.reply({ embeds: [successEmbed(`Custom command **${name}** created!`)] });
  },
};
