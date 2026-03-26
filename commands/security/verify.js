const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed, embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Complete captcha verification to gain access'),
  async execute(interaction) {
    const verifyRoleId = db.get(interaction.guild.id, 'verify_role');
    if (!verifyRoleId) return interaction.reply({ embeds: [errorEmbed('Verification is not set up. An admin must run `/setverifyrole` first.')], ephemeral: true });

    // Simple math captcha
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const answer = a + b;

    await interaction.reply({
      embeds: [embed('info').setTitle('🔒 Verification').setDescription(`Solve this to verify: **What is ${a} + ${b}?**\n\nType your answer in this channel within 30 seconds.`)],
      ephemeral: true,
    });

    const filter = (m) => m.author.id === interaction.user.id;
    try {
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
      const response = collected.first();
      try { await response.delete(); } catch (e) {}

      if (parseInt(response.content) === answer) {
        await interaction.member.roles.add(verifyRoleId);
        await interaction.followUp({ embeds: [successEmbed('You have been verified!')], ephemeral: true });
      } else {
        await interaction.followUp({ embeds: [errorEmbed('Wrong answer. Please try again with `/verify`.')], ephemeral: true });
      }
    } catch (e) {
      await interaction.followUp({ embeds: [errorEmbed('Verification timed out. Try again.')], ephemeral: true });
    }
  },
};
