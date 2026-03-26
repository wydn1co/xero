const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embed, successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Create a reaction role message')
    .addRoleOption(o => o.setName('role1').setDescription('First role').setRequired(true))
    .addStringOption(o => o.setName('emoji1').setDescription('First emoji').setRequired(true))
    .addRoleOption(o => o.setName('role2').setDescription('Second role'))
    .addStringOption(o => o.setName('emoji2').setDescription('Second emoji'))
    .addRoleOption(o => o.setName('role3').setDescription('Third role'))
    .addStringOption(o => o.setName('emoji3').setDescription('Third emoji'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const roles = [];
    for (let i = 1; i <= 3; i++) {
      const role = interaction.options.getRole(`role${i}`);
      const emoji = interaction.options.getString(`emoji${i}`);
      if (role && emoji) roles.push({ role, emoji });
    }
    if (roles.length === 0) return interaction.reply({ embeds: [errorEmbed('Provide at least one role-emoji pair.')], ephemeral: true });

    const desc = roles.map(r => `${r.emoji} — ${r.role}`).join('\n');
    const e = embed('purple').setTitle('🎭 Role Selection').setDescription(`Pick your roles:\n\n${desc}`);

    const msg = await interaction.channel.send({ embeds: [e] });
    for (const r of roles) {
      try { await msg.react(r.emoji); } catch (e) {}
    }

    const db = require('../../database');
    for (const r of roles) {
      db.addReactionRole(interaction.guild.id, interaction.channel.id, msg.id, r.emoji, r.role.id);
    }
    await interaction.reply({ embeds: [successEmbed('Reaction role message created!')], ephemeral: true });
  },
};
