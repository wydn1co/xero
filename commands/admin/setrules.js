const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setrules')
    .setDescription('Update server rules')
    .addStringOption(o => o.setName('text').setDescription('Rules text (use \\n for new lines)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const text = interaction.options.getString('text').replace(/\\n/g, '\n');
    db.set(interaction.guild.id, 'rules', text);
    await interaction.reply({ embeds: [successEmbed('Server rules updated!')] });
  },
};
