const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Play the slot machine'),
  async execute(interaction) {
    const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎', '7️⃣'];
    const r1 = symbols[Math.floor(Math.random() * symbols.length)];
    const r2 = symbols[Math.floor(Math.random() * symbols.length)];
    const r3 = symbols[Math.floor(Math.random() * symbols.length)];

    let result, color, payout = 0;
    const eco = db.getEconomy(interaction.guild.id, interaction.user.id);

    if (r1 === r2 && r2 === r3) {
      payout = r1 === '💎' ? 500 : r1 === '7️⃣' ? 1000 : 200;
      result = `🎉 **JACKPOT!** You won 🪙 **${payout}** coins!`;
      color = 'success';
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      payout = 50;
      result = `Nice! Two matching! You won 🪙 **${payout}** coins!`;
      color = 'warn';
    } else {
      result = 'No match. Better luck next time!';
      color = 'error';
    }

    if (payout > 0) db.setEconomy(interaction.guild.id, interaction.user.id, eco.balance + payout, eco.last_daily);

    await interaction.reply({
      embeds: [embed(color)
        .setTitle('🎰 Slot Machine')
        .setDescription(`> ${r1} | ${r2} | ${r3}\n\n${result}`)],
    });
  },
};
