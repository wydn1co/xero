const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get the bot invite link'),
  async execute(interaction, client) {
    const link = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
    await interaction.reply({
      embeds: [embed('info')
        .setTitle('🔗 Invite Me')
        .setDescription(`[Click here to invite me to your server!](${link})`)],
    });
  },
};
