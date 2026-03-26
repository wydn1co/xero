const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode for a channel')
    .addIntegerOption(o => o.setName('seconds').setDescription('Slowmode in seconds (0 to disable)').setRequired(true).setMinValue(0).setMaxValue(21600))
    .addChannelOption(o => o.setName('channel').setDescription('Channel').addChannelTypes(ChannelType.GuildText))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    try {
      await channel.setRateLimitPerUser(seconds);
      if (seconds === 0) await interaction.reply({ embeds: [successEmbed(`Slowmode disabled in ${channel}.`)] });
      else await interaction.reply({ embeds: [successEmbed(`Slowmode set to **${seconds}s** in ${channel}.`)] });
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to set slowmode.')], ephemeral: true }); }
  },
};
