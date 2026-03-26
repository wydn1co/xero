const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setupmute')
    .setDescription('Create a muted role and apply it to all channels')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply();
    const guild = interaction.guild;

    try {
      let muteRole = guild.roles.cache.find(r => r.name === 'Muted');
      if (!muteRole) {
        muteRole = await guild.roles.create({ name: 'Muted', color: 0x818386, permissions: [] });
      }
      db.set(guild.id, 'mute_role', muteRole.id);

      for (const [, channel] of guild.channels.cache) {
        try {
          await channel.permissionOverwrites.edit(muteRole, {
            SendMessages: false,
            AddReactions: false,
            Speak: false,
            SendMessagesInThreads: false,
          });
        } catch (e) {}
      }

      await interaction.editReply({ embeds: [successEmbed(`Mute role **${muteRole.name}** created and applied to all channels.`)] });
    } catch (e) {
      await interaction.editReply({ embeds: [errorEmbed('Failed to set up mute role.')] });
    }
  },
};
