const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lock a channel')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to lock').addChannelTypes(ChannelType.GuildText))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    try {
      await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
      await interaction.reply({ embeds: [successEmbed(`🔒 ${channel} has been locked.`)] });
      await logAction(interaction.guild, modEmbed('🔒 Channel Locked', `**Channel:** ${channel}\n**Moderator:** ${interaction.user.tag}`));
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to lock channel.')], ephemeral: true }); }
  },
};
