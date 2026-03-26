const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { embed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const warns = db.getWarnings(interaction.guild.id, user.id);
    if (warns.length === 0) return interaction.reply({ embeds: [embed('success').setDescription(`**${user.tag}** has no warnings.`)] });
    const list = warns.map((w, i) => `**#${i + 1}** — ${w.reason}\n> By <@${w.moderator_id}> • <t:${Math.floor(new Date(w.created_at).getTime() / 1000)}:R>`).join('\n\n');
    await interaction.reply({ embeds: [embed('warn').setTitle(`⚠️ Warnings for ${user.tag}`).setDescription(list).setFooter({ text: `Total: ${warns.length}` })] });
  },
};
