const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Show your XP level and rank'),
  async execute(interaction) {
    const xpData = db.getXP(interaction.guild.id, interaction.user.id);
    const nextLevelXp = (xpData.level + 1) * 100;
    const progress = Math.floor((xpData.xp / nextLevelXp) * 20);
    const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);
    const e = embed('purple')
      .setTitle(`${interaction.user.tag}'s Rank`)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
      .addFields(
        { name: 'Level', value: `${xpData.level}`, inline: true },
        { name: 'XP', value: `${xpData.xp} / ${nextLevelXp}`, inline: true },
        { name: 'Progress', value: `\`${bar}\` ${Math.floor((xpData.xp / nextLevelXp) * 100)}%` },
      );
    await interaction.reply({ embeds: [e] });
  },
};
