const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');
const db = require('../../database');
const { embed, successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a giveaway')
    .addStringOption(o => o.setName('time').setDescription('Duration (e.g. 1h, 1d)').setRequired(true))
    .addStringOption(o => o.setName('prize').setDescription('Prize description').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const timeStr = interaction.options.getString('time');
    const prize = interaction.options.getString('prize');
    const duration = ms(timeStr);
    if (!duration) return interaction.reply({ embeds: [errorEmbed('Invalid duration.')], ephemeral: true });
    const endsAt = new Date(Date.now() + duration).toISOString();

    const giveawayEmbed = embed('success')
      .setTitle('🎉 GIVEAWAY 🎉')
      .setDescription(`**Prize:** ${prize}\n**Ends:** <t:${Math.floor((Date.now() + duration) / 1000)}:R>\n**Hosted by:** ${interaction.user}\n\nReact with 🎉 to enter!`);

    await interaction.reply({ content: '🎉 Giveaway created!' , ephemeral: true });
    const msg = await interaction.channel.send({ embeds: [giveawayEmbed] });
    await msg.react('🎉');
    db.addGiveaway(interaction.guild.id, interaction.channel.id, msg.id, prize, endsAt);
  },
};
