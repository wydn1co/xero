const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetnick')
    .setDescription("Reset a user's nickname")
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });
    try {
      await member.setNickname(null);
      await interaction.reply({ embeds: [successEmbed(`Nickname for **${user.tag}** has been reset.`)] });
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to reset nickname.')], ephemeral: true }); }
  },
};
