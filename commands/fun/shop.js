const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { embed } = require('../../utils/helpers');

const DEFAULT_SHOP = [
  { name: 'Custom Role Color', price: 5000, description: 'Get a custom colored role' },
  { name: 'VIP Badge', price: 10000, description: 'Exclusive VIP badge role' },
  { name: 'Double XP (1h)', price: 2000, description: 'Earn double XP for 1 hour' },
  { name: 'Lucky Charm', price: 1000, description: 'Better odds in gambling for 1 hour' },
  { name: 'Nickname Change', price: 500, description: 'Change someone\'s nickname' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View the server shop'),
  async execute(interaction) {
    const items = db.getShop(interaction.guild.id);
    const displayItems = items.length > 0 ? items : DEFAULT_SHOP;
    const list = displayItems.map((item, i) =>
      `**${i + 1}.** ${item.name} — 🪙 **${item.price.toLocaleString()}**\n> ${item.description || 'No description'}`
    ).join('\n\n');
    const eco = db.getEconomy(interaction.guild.id, interaction.user.id);
    await interaction.reply({
      embeds: [embed('purple')
        .setTitle('🛒 Server Shop')
        .setDescription(list)
        .setFooter({ text: `Your balance: ${eco.balance.toLocaleString()} coins | Use /buy <item> to purchase` })],
    });
  },
};
