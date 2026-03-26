const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Show your owned items'),
  async execute(interaction) {
    const inv = db.getInventory(interaction.guild.id, interaction.user.id);
    if (inv.length === 0) return interaction.reply({ embeds: [embed('info').setDescription('Your inventory is empty.')] });
    const list = inv.map(i => `• **${i.item_name}** x${i.quantity}`).join('\n');
    await interaction.reply({ embeds: [embed('purple').setTitle('🎒 Your Inventory').setDescription(list)] });
  },
};
