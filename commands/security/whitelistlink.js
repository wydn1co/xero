const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelistlink')
    .setDescription('Allow a domain through the anti-link filter')
    .addStringOption(o => o.setName('domain').setDescription('Domain to whitelist (e.g. youtube.com)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const domain = interaction.options.getString('domain');
    db.addWhitelistLink(interaction.guild.id, domain);
    await interaction.reply({ embeds: [successEmbed(`**${domain}** has been whitelisted.`)] });
  },
};
