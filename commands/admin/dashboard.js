const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Get the web dashboard link'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [embed('info')
        .setTitle('🖥️ Dashboard')
        .setDescription('The web dashboard is coming soon!\n\nFor now, manage the bot using slash commands.\nUse `/help` for a list of all commands.')],
    });
  },
};
