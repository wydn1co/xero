const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Show bot uptime'),
  async execute(interaction, client) {
    const uptime = Date.now() - client.startedAt;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor((uptime % 86400000) / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);
    await interaction.reply({
      embeds: [embed('success')
        .setTitle('⏰ Uptime')
        .setDescription(`**${days}d ${hours}h ${minutes}m ${seconds}s**`)],
    });
  },
};
