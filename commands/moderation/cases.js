const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cases')
    .setDescription('View recent moderation cases')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const cases = db.getCases(interaction.guild.id);
    if (cases.length === 0) return interaction.reply({ embeds: [embed('info').setDescription('No moderation cases found.')] });
    const list = cases.slice(0, 15).map(c =>
      `**Case #${c.id}** — \`${c.action}\`\n> User: <@${c.user_id}> | Mod: <@${c.moderator_id}>\n> ${c.reason || 'No reason'} • <t:${Math.floor(new Date(c.created_at).getTime() / 1000)}:R>`
    ).join('\n\n');
    await interaction.reply({ embeds: [embed('mod').setTitle('📋 Moderation Cases').setDescription(list)] });
  },
};
