const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automessage')
    .setDescription('Send an automated message (one-time scheduled message)')
    .addStringOption(o => o.setName('time').setDescription('Time delay (e.g. 10m, 1h)').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Message to send').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const ms = require('ms');
    const timeStr = interaction.options.getString('time');
    const message = interaction.options.getString('message');
    const duration = ms(timeStr);
    if (!duration) return interaction.reply({ content: 'Invalid time format.', ephemeral: true });
    const channel = interaction.channel;
    await interaction.reply({ embeds: [successEmbed(`Scheduled message in **${timeStr}**.`)] });
    setTimeout(async () => {
      try { await channel.send(message); } catch (e) {}
    }, duration);
  },
};
