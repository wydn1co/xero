const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiraid')
    .setDescription('Toggle raid protection')
    .addStringOption(o => o.setName('toggle').setDescription('on/off').setRequired(true).addChoices({ name: 'On', value: 'on' }, { name: 'Off', value: 'off' }))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const toggle = interaction.options.getString('toggle');
    db.set(interaction.guild.id, 'antiraid', toggle);
    if (toggle === 'on') {
      try {
        await interaction.guild.setVerificationLevel(3); // HIGH
        await interaction.reply({ embeds: [successEmbed('Anti-raid enabled. Verification level set to **HIGH**. New members must have a verified phone.')] });
      } catch (e) {
        await interaction.reply({ embeds: [successEmbed('Anti-raid enabled (could not change verification level).')] });
      }
    } else {
      try {
        await interaction.guild.setVerificationLevel(1); // LOW
        await interaction.reply({ embeds: [successEmbed('Anti-raid disabled. Verification level set to **LOW**.')] });
      } catch (e) {
        await interaction.reply({ embeds: [successEmbed('Anti-raid disabled.')] });
      }
    }
  },
};
