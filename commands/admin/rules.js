const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { embed, successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Show server rules'),
  async execute(interaction) {
    const rules = db.get(interaction.guild.id, 'rules');
    if (!rules) return interaction.reply({ embeds: [embed('info').setDescription('No rules have been set. An admin can use `/setrules` to set them.')] });
    await interaction.reply({ embeds: [embed('info').setTitle('📜 Server Rules').setDescription(rules)] });
  },
};
