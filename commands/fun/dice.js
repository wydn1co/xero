const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice'),
  async execute(interaction) {
    const result = Math.floor(Math.random() * 6) + 1;
    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    await interaction.reply({ embeds: [embed('info').setTitle(`🎲 Dice Roll`).setDescription(`${diceEmojis[result - 1]} You rolled a **${result}**!`)] });
  },
};
