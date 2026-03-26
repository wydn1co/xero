const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop')
    .addStringOption(o => o.setName('item').setDescription('Item name').setRequired(true)),
  async execute(interaction) {
    const itemName = interaction.options.getString('item');
    const item = db.getShopItem(interaction.guild.id, itemName);
    const price = item ? item.price : null;
    if (!price) return interaction.reply({ embeds: [errorEmbed('Item not found in shop. Use `/shop` to see available items.')], ephemeral: true });
    const eco = db.getEconomy(interaction.guild.id, interaction.user.id);
    if (eco.balance < price) return interaction.reply({ embeds: [errorEmbed(`Not enough coins. You need 🪙 **${price}** but have **${eco.balance}**.`)], ephemeral: true });
    db.setEconomy(interaction.guild.id, interaction.user.id, eco.balance - price, eco.last_daily);
    db.addInventoryItem(interaction.guild.id, interaction.user.id, itemName, 1);
    await interaction.reply({ embeds: [successEmbed(`Purchased **${itemName}** for 🪙 **${price}**!\nRemaining balance: **${(eco.balance - price).toLocaleString()}**`)] });
  },
};
