const { SlashCommandBuilder } = require('discord.js');
const { embed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('time')
    .setDescription('Get current time for a city')
    .addStringOption(o => o.setName('city').setDescription('City name').setRequired(true)),
  async execute(interaction) {
    const city = interaction.options.getString('city');
    try {
      const fetch = require('node-fetch');
      const res = await fetch(`https://worldtimeapi.org/api/timezone`);
      const timezones = await res.json();

      // Try to find a matching timezone
      const match = timezones.find(tz => tz.toLowerCase().includes(city.toLowerCase()));
      if (!match) {
        await interaction.reply({ embeds: [embed('info').setTitle(`🕐 Time Check`).setDescription(`Current UTC time: **${new Date().toUTCString()}**\n\nCouldn't find a specific timezone for "${city}". Try using a timezone name like "America/New_York".`)] });
        return;
      }

      const tzRes = await fetch(`https://worldtimeapi.org/api/timezone/${match}`);
      const tzData = await tzRes.json();
      const dateTime = new Date(tzData.datetime);

      await interaction.reply({
        embeds: [embed('info')
          .setTitle(`🕐 Time in ${match.replace(/_/g, ' ')}`)
          .setDescription(`**${dateTime.toLocaleString('en-US', { timeZone: match, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}**\n\nTimezone: \`${tzData.timezone}\`\nUTC Offset: \`${tzData.utc_offset}\``)],
      });
    } catch (e) {
      await interaction.reply({ embeds: [errorEmbed('Could not fetch time data.')], ephemeral: true });
    }
  },
};
