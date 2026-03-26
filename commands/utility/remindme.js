const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms');
const db = require('../../database');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remindme')
    .setDescription('Set a reminder')
    .addStringOption(o => o.setName('time').setDescription('When to remind (e.g. 10m, 1h, 1d)').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Reminder message').setRequired(true)),
  async execute(interaction) {
    const timeStr = interaction.options.getString('time');
    const message = interaction.options.getString('message');
    const duration = ms(timeStr);
    if (!duration) return interaction.reply({ embeds: [errorEmbed('Invalid time format.')], ephemeral: true });
    const remindAt = new Date(Date.now() + duration).toISOString();
    db.addReminder(interaction.user.id, interaction.channel.id, message, remindAt);
    await interaction.reply({ embeds: [successEmbed(`I'll remind you in **${timeStr}**: ${message}`)] });
  },
};
