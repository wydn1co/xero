const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antimention')
    .setDescription('Toggle mass mention protection')
    .addStringOption(o => o.setName('toggle').setDescription('on/off').setRequired(true).addChoices({ name: 'On', value: 'on' }, { name: 'Off', value: 'off' }))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const toggle = interaction.options.getString('toggle');
    db.set(interaction.guild.id, 'antimention', toggle);
    await interaction.reply({ embeds: [successEmbed(`Anti-mention has been turned **${toggle}**.`)] });
  },
};
