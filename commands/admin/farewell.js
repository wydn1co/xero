const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farewell')
    .setDescription('Set the farewell message')
    .addStringOption(o => o.setName('message').setDescription('Farewell message. Use {user}, {server}, {membercount}').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Channel for farewell messages'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel');
    db.set(interaction.guild.id, 'farewell_message', message);
    if (channel) db.set(interaction.guild.id, 'farewell_channel', channel.id);
    await interaction.reply({ embeds: [successEmbed(`Farewell message set!\n**Message:** ${message}`)] });
  },
};
