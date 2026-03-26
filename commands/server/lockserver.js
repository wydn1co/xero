const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockserver')
    .setDescription('Lock the entire server (deny send messages in all channels)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply();
    const guild = interaction.guild;
    let locked = 0;
    for (const [, channel] of guild.channels.cache) {
      if (!channel.isTextBased()) continue;
      try {
        await channel.permissionOverwrites.edit(guild.id, { SendMessages: false });
        locked++;
      } catch (e) {}
    }
    await interaction.editReply({ embeds: [successEmbed(`🔒 Server locked. ${locked} channels affected.`)] });
    await logAction(guild, modEmbed('🔒 Server Locked', `**Moderator:** ${interaction.user.tag}\n**Channels:** ${locked}`));
  },
};
