const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Vote for the bot'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [embed('info')
        .setTitle('🗳️ Vote for Us!')
        .setDescription('Support us by voting on these platforms:\n\n🔹 [Top.gg](https://top.gg)\n🔹 [Discord Bot List](https://discordbotlist.com)\n\nThank you for your support! ❤️')],
    });
  },
};
