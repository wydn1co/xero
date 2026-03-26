const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Set the welcome message')
    .addStringOption(o => o.setName('message').setDescription('Welcome message. Use {user}, {server}, {membercount}').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Channel to send welcome messages'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    db.set(interaction.guild.id, 'welcome_message', message);
    db.set(interaction.guild.id, 'welcome_channel', channel.id);
    await interaction.reply({ embeds: [successEmbed(`Welcome message set!\n**Channel:** ${channel}\n**Message:** ${message}`)] });
  },
};
