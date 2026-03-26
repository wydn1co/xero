const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('support')
    .setDescription('Get support server link'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [embed('info')
        .setTitle('💬 Support')
        .setDescription('Need help? Join our [support server](https://discord.gg/support)!\n\nOr use `/bugreport` to report a bug.')],
    });
  },
};
