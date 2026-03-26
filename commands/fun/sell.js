const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Sell an item from your inventory')
    .addStringOption(o => o.setName('item').setDescription('Item name').setRequired(true)),
  async execute(interaction) {
    const itemName = interaction.options.getString('item');
    const removed = db.removeInventoryItem(interaction.guild.id, interaction.user.id, itemName, 1);
    if (!removed) return interaction.reply({ embeds: [errorEmbed("You don't have that item.")], ephemeral: true });
    const refund = Math.floor(Math.random() * 200) + 50;
    const eco = db.getEconomy(interaction.guild.id, interaction.user.id);
    db.setEconomy(interaction.guild.id, interaction.user.id, eco.balance + refund, eco.last_daily);
    await interaction.reply({ embeds: [successEmbed(`Sold **${itemName}** for 🪙 **${refund}** coins!`)] });
  },
};
