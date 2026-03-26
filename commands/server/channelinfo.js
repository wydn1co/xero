const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('Get details about a channel')
    .addChannelOption(o => o.setName('channel').setDescription('Channel')),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const e = embed('info')
      .setTitle(`# ${channel.name}`)
      .addFields(
        { name: 'ID', value: channel.id, inline: true },
        { name: 'Type', value: ChannelType[channel.type] || 'Unknown', inline: true },
        { name: 'Position', value: `${channel.position ?? 'N/A'}`, inline: true },
        { name: 'NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true },
        { name: 'Slowmode', value: `${channel.rateLimitPerUser || 0}s`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true },
      );
    if (channel.topic) e.addFields({ name: 'Topic', value: channel.topic });
    await interaction.reply({ embeds: [e] });
  },
};
