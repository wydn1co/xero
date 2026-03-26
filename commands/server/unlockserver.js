const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlockserver')
    .setDescription('Unlock the entire server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply();
    const guild = interaction.guild;
    let unlocked = 0;
    for (const [, channel] of guild.channels.cache) {
      if (!channel.isTextBased()) continue;
      try {
        await channel.permissionOverwrites.edit(guild.id, { SendMessages: null });
        unlocked++;
      } catch (e) {}
    }
    await interaction.editReply({ embeds: [successEmbed(`🔓 Server unlocked. ${unlocked} channels affected.`)] });
    await logAction(guild, modEmbed('🔓 Server Unlocked', `**Moderator:** ${interaction.user.tag}\n**Channels:** ${unlocked}`));
  },
};
