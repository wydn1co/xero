const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed, logAction } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages')
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete (1-100)').setMinValue(1).setMaxValue(100))
    .addUserOption(o => o.setName('user').setDescription('Delete messages from this user only'))
    .addStringOption(o => o.setName('filter').setDescription('Filter type').addChoices(
      { name: 'Bots only', value: 'bots' },
      { name: 'Images only', value: 'images' },
    ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount') || 50;
    const targetUser = interaction.options.getUser('user');
    const filter = interaction.options.getString('filter');

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await interaction.channel.messages.fetch({ limit: amount });

      if (targetUser) {
        messages = messages.filter(m => m.author.id === targetUser.id);
      } else if (filter === 'bots') {
        messages = messages.filter(m => m.author.bot);
      } else if (filter === 'images') {
        messages = messages.filter(m => m.attachments.size > 0 || m.embeds.some(e => e.image || e.thumbnail));
      }

      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      messages = messages.filter(m => m.createdTimestamp > twoWeeksAgo);

      if (messages.size === 0) return interaction.editReply({ embeds: [errorEmbed('No messages found matching the criteria.')] });

      const deleted = await interaction.channel.bulkDelete(messages, true);
      await interaction.editReply({ embeds: [successEmbed(`Deleted **${deleted.size}** messages.`)] });
      await logAction(interaction.guild, modEmbed('🗑️ Messages Purged', `**Channel:** ${interaction.channel}\n**Count:** ${deleted.size}\n**Moderator:** ${interaction.user.tag}${targetUser ? `\n**Target User:** ${targetUser.tag}` : ''}${filter ? `\n**Filter:** ${filter}` : ''}`));
    } catch (e) {
      await interaction.editReply({ embeds: [errorEmbed('Failed to delete messages. Messages older than 14 days cannot be bulk deleted.')] });
    }
  },
};
