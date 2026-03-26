const { SlashCommandBuilder } = require('discord.js');
const { embed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get weather information for a city')
    .addStringOption(o => o.setName('city').setDescription('City name').setRequired(true)),
  async execute(interaction) {
    const city = interaction.options.getString('city');
    try {
      const fetch = require('node-fetch');
      const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      if (!res.ok) throw new Error('City not found');
      const data = await res.json();
      const current = data.current_condition[0];
      const e = embed('info')
        .setTitle(`🌤️ Weather in ${data.nearest_area[0].areaName[0].value}`)
        .addFields(
          { name: 'Temperature', value: `${current.temp_C}°C / ${current.temp_F}°F`, inline: true },
          { name: 'Feels Like', value: `${current.FeelsLikeC}°C / ${current.FeelsLikeF}°F`, inline: true },
          { name: 'Condition', value: current.weatherDesc[0].value, inline: true },
          { name: 'Humidity', value: `${current.humidity}%`, inline: true },
          { name: 'Wind', value: `${current.windspeedKmph} km/h ${current.winddir16Point}`, inline: true },
          { name: 'Visibility', value: `${current.visibility} km`, inline: true },
        );
      await interaction.reply({ embeds: [e] });
    } catch (e) {
      await interaction.reply({ embeds: [errorEmbed('Could not find weather data for that city.')], ephemeral: true });
    }
  },
};
