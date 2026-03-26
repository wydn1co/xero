const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Show server bot statistics'),
  async execute(interaction, client) {
    const guildId = interaction.guild.id;
    const cases = db.getCases(guildId);
    const warnsCount = db.db.prepare('SELECT COUNT(*) as count FROM warnings WHERE guild_id = ?').get(guildId).count;
    const memUsage = process.memoryUsage();
    const e = embed('purple')
      .setTitle('📊 Bot Statistics')
      .addFields(
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${client.users.cache.size}`, inline: true },
        { name: 'Commands', value: `${client.commands.size}`, inline: true },
        { name: 'Mod Cases', value: `${cases.length}`, inline: true },
        { name: 'Warnings', value: `${warnsCount}`, inline: true },
        { name: 'Memory', value: `${(memUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`, inline: true },
        { name: 'Node.js', value: process.version, inline: true },
      );
    await interaction.reply({ embeds: [e] });
  },
};
