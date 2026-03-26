const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed, embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Gamble your coins')
    .addIntegerOption(o => o.setName('amount').setDescription('Amount to gamble').setRequired(true).setMinValue(10)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const eco = db.getEconomy(interaction.guild.id, interaction.user.id);
    if (eco.balance < amount) return interaction.reply({ embeds: [errorEmbed(`You don't have enough coins. Balance: **${eco.balance}**`)], ephemeral: true });
    const win = Math.random() < 0.45;
    const multiplier = win ? (Math.random() < 0.2 ? 3 : 2) : 0;
    const payout = Math.floor(amount * multiplier);
    const newBalance = eco.balance - amount + payout;
    db.setEconomy(interaction.guild.id, interaction.user.id, newBalance, eco.last_daily);
    if (win) {
      await interaction.reply({ embeds: [embed('success').setTitle('🎰 You Won!').setDescription(`You bet 🪙 **${amount}** and won 🪙 **${payout}**! (${multiplier}x)\nNew balance: **${newBalance.toLocaleString()}**`)] });
    } else {
      await interaction.reply({ embeds: [embed('error').setTitle('🎰 You Lost!').setDescription(`You bet 🪙 **${amount}** and lost it all.\nNew balance: **${newBalance.toLocaleString()}**`)] });
    }
  },
};
