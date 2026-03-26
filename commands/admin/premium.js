const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('premium')
    .setDescription('View premium perks'),
  async execute(interaction) {
    const e = embed('purple')
      .setTitle('⭐ Premium Perks')
      .setDescription('Upgrade to premium for exclusive features!\n\n' +
        '🔹 **Custom Welcome Images** — Branded welcome cards\n' +
        '🔹 **Advanced Auto-mod** — AI-powered moderation\n' +
        '🔹 **Unlimited Backups** — Save unlimited server backups\n' +
        '🔹 **Custom Dashboard** — Full web dashboard access\n' +
        '🔹 **Priority Support** — Get help instantly\n' +
        '🔹 **No Cooldowns** — Remove all command cooldowns\n' +
        '🔹 **Music Player** — High-quality music playback\n\n' +
        '💎 Coming soon! Stay tuned.');
    await interaction.reply({ embeds: [e] });
  },
};
