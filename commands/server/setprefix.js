const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setprefix')
    .setDescription('Change the bot prefix (for legacy reference)')
    .addStringOption(o => o.setName('prefix').setDescription('New prefix').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const prefix = interaction.options.getString('prefix');
    db.set(interaction.guild.id, 'prefix', prefix);
    await interaction.reply({ embeds: [successEmbed(`Prefix set to \`${prefix}\`. Note: This bot primarily uses slash commands.`)] });
  },
};
