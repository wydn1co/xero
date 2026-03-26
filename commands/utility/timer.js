const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms');
const { successEmbed, errorEmbed, embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('Set a countdown timer')
    .addStringOption(o => o.setName('time').setDescription('Duration (e.g. 30s, 5m, 1h)').setRequired(true)),
  async execute(interaction) {
    const timeStr = interaction.options.getString('time');
    const duration = ms(timeStr);
    if (!duration || duration > 24 * 60 * 60 * 1000) return interaction.reply({ embeds: [errorEmbed('Invalid time. Max 24h.')], ephemeral: true });
    const endsAt = Math.floor((Date.now() + duration) / 1000);
    await interaction.reply({ embeds: [embed('info').setTitle('⏱️ Timer Set').setDescription(`Timer ends <t:${endsAt}:R>`)] });
    setTimeout(async () => {
      try { await interaction.channel.send(`⏰ <@${interaction.user.id}> Timer is up! (**${timeStr}**)`); } catch (e) {}
    }, duration);
  },
};
