const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription("Change a user's nickname")
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addStringOption(o => o.setName('nickname').setDescription('New nickname').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const nickname = interaction.options.getString('nickname');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });
    try {
      await member.setNickname(nickname);
      await interaction.reply({ embeds: [successEmbed(`Nickname for **${user.tag}** set to **${nickname}**.`)] });
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to change nickname.')], ephemeral: true }); }
  },
};
