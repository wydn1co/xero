const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { successEmbed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward'),
  async execute(interaction) {
    const eco = db.getEconomy(interaction.guild.id, interaction.user.id);
    const now = new Date();
    if (eco.last_daily) {
      const last = new Date(eco.last_daily);
      const diff = now - last;
      if (diff < 24 * 60 * 60 * 1000) {
        const remaining = 24 * 60 * 60 * 1000 - diff;
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        return interaction.reply({ embeds: [errorEmbed(`You already claimed today. Come back in **${hours}h ${mins}m**.`)], ephemeral: true });
      }
    }
    const reward = Math.floor(Math.random() * 200) + 100;
    db.setEconomy(interaction.guild.id, interaction.user.id, eco.balance + reward, now.toISOString());
    await interaction.reply({ embeds: [successEmbed(`You claimed your daily reward of 🪙 **${reward}** coins!\nNew balance: **${(eco.balance + reward).toLocaleString()}**`)] });
  },
};
