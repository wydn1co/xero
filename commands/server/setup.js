const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Initialize jail channel, jail role, and log channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply();
    const guild = interaction.guild;

    try {
      // Create jail role
      let jailRole = guild.roles.cache.find(r => r.name === 'Jailed');
      if (!jailRole) {
        jailRole = await guild.roles.create({ name: 'Jailed', color: 0x808080, permissions: [] });
      }
      db.set(guild.id, 'jail_role', jailRole.id);

      // Create jail channel
      let jailChannel = guild.channels.cache.find(c => c.name === 'jail');
      if (!jailChannel) {
        jailChannel = await guild.channels.create({
          name: 'jail',
          type: ChannelType.GuildText,
          permissionOverwrites: [
            { id: guild.id, deny: ['ViewChannel'] },
            { id: jailRole.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
          ],
        });
      }
      db.set(guild.id, 'jail_channel', jailChannel.id);

      // Create log channel
      let logChannel = guild.channels.cache.find(c => c.name === 'mod-logs');
      if (!logChannel) {
        logChannel = await guild.channels.create({
          name: 'mod-logs',
          type: ChannelType.GuildText,
          permissionOverwrites: [
            { id: guild.id, deny: ['ViewChannel'] },
          ],
        });
      }
      db.set(guild.id, 'log_channel', logChannel.id);

      // Deny jailed role from all other channels
      for (const [, channel] of guild.channels.cache) {
        if (channel.id === jailChannel.id) continue;
        try {
          await channel.permissionOverwrites.edit(jailRole, { ViewChannel: false, SendMessages: false });
        } catch (e) {}
      }

      await interaction.editReply({
        embeds: [successEmbed(`Setup complete!\n🔒 Jail Role: ${jailRole}\n📌 Jail Channel: ${jailChannel}\n📋 Log Channel: ${logChannel}`)],
      });
    } catch (e) {
      await interaction.editReply({ embeds: [errorEmbed('Setup failed. Make sure I have the required permissions.')] });
    }
  },
};
