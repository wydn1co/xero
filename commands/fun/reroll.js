const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reroll')
    .setDescription('Reroll a giveaway winner')
    .addStringOption(o => o.setName('messageid').setDescription('Giveaway message ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const messageId = interaction.options.getString('messageid');
    const giveaway = db.getGiveawayByMessage(messageId);
    if (!giveaway) return interaction.reply({ embeds: [errorEmbed('Giveaway not found.')], ephemeral: true });
    try {
      const channel = await interaction.guild.channels.fetch(giveaway.channel_id);
      const message = await channel.messages.fetch(messageId);
      const reaction = message.reactions.cache.get('🎉');
      if (!reaction) return interaction.reply({ embeds: [errorEmbed('No reactions found.')], ephemeral: true });
      const users = await reaction.users.fetch();
      const eligible = users.filter(u => !u.bot);
      if (eligible.size === 0) return interaction.reply({ embeds: [errorEmbed('No eligible users.')], ephemeral: true });
      const winner = eligible.random();
      db.endGiveaway(giveaway.id, winner.id);
      await interaction.reply({ embeds: [successEmbed(`🎉 New winner: <@${winner.id}>! Prize: **${giveaway.prize}**`)] });
    } catch (e) { await interaction.reply({ embeds: [errorEmbed('Failed to reroll.')], ephemeral: true }); }
  },
};
