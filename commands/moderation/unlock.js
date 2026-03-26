const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to unlock').addChannelTypes(ChannelType.GuildText))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    try {
      await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
      await interaction.reply({ embeds: [successEmbed(`🔓 ${channel} has been unlocked.`)] });
      await logAction(interaction.guild, modEmbed('🔓 Channel Unlocked', `**Channel:** ${channel}\n**Moderator:** ${interaction.user.tag}`));
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to unlock channel.')], ephemeral: true }); }
  },
};
