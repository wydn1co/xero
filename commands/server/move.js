const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('Move a user to a voice channel')
    .addUserOption(o => o.setName('user').setDescription('User to move').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Target voice channel').setRequired(true).addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const channel = interaction.options.getChannel('channel');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });
    if (!member.voice.channel) return interaction.reply({ embeds: [errorEmbed('User is not in a voice channel.')], ephemeral: true });
    try {
      await member.voice.setChannel(channel);
      await interaction.reply({ embeds: [successEmbed(`Moved **${user.tag}** to **${channel.name}**.`)] });
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to move user.')], ephemeral: true }); }
  },
};
