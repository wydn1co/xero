const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top XP users'),
  async execute(interaction) {
    const top = db.getTopXP(interaction.guild.id);
    if (top.length === 0) return interaction.reply({ embeds: [embed('info').setDescription('No XP data yet.')] });
    const list = top.map((u, i) => {
      const medal = ['🥇', '🥈', '🥉'][i] || `**${i + 1}.**`;
      return `${medal} <@${u.user_id}> — Level **${u.level}** (${u.xp} XP)`;
    }).join('\n');
    await interaction.reply({ embeds: [embed('purple').setTitle('🏆 XP Leaderboard').setDescription(list)] });
  },
};
