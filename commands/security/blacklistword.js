const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklistword')
    .setDescription('Add a word to the blacklist')
    .addStringOption(o => o.setName('word').setDescription('Word to blacklist').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const word = interaction.options.getString('word');
    db.addBlacklistWord(interaction.guild.id, word);
    await interaction.reply({ embeds: [successEmbed(`**${word}** has been blacklisted.`)], ephemeral: true });
  },
};
