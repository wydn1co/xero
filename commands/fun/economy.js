const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Check your currency balance')
    .addUserOption(o => o.setName('user').setDescription('User to check')),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const eco = db.getEconomy(interaction.guild.id, user.id);
    await interaction.reply({
      embeds: [embed('success')
        .setTitle(`💰 ${user.tag}'s Balance`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 }))
        .addFields({ name: 'Balance', value: `🪙 **${eco.balance.toLocaleString()}** coins` })],
    });
  },
};
