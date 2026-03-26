const { SlashCommandBuilder } = require('discord.js');
const { embed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calc')
    .setDescription('Evaluate a math expression')
    .addStringOption(o => o.setName('expression').setDescription('Math expression (e.g. 2+2, sqrt(16))').setRequired(true)),
  async execute(interaction) {
    const expression = interaction.options.getString('expression');
    try {
      // Safe math eval — only allow numbers, operators, parentheses, and math functions
      const sanitized = expression.replace(/[^0-9+\-*/().%^sqrt,piePIE\s]/g, '');
      const withMath = sanitized
        .replace(/sqrt/gi, 'Math.sqrt')
        .replace(/pi/gi, 'Math.PI')
        .replace(/\^/g, '**');
      const result = Function(`"use strict"; return (${withMath})`)();
      if (typeof result !== 'number' || !isFinite(result)) throw new Error('Invalid result');
      await interaction.reply({
        embeds: [embed('success')
          .setTitle('🔢 Calculator')
          .addFields(
            { name: 'Expression', value: `\`${expression}\`` },
            { name: 'Result', value: `**${result}**` },
          )],
      });
    } catch (e) {
      await interaction.reply({ embeds: [errorEmbed('Invalid expression. Use numbers and operators like +, -, *, /, ^, sqrt().')], ephemeral: true });
    }
  },
};
