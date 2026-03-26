const { SlashCommandBuilder } = require('discord.js');
const { embed, errorEmbed } = require('../../utils/helpers');

const CONVERSIONS = {
  km_mi: { factor: 0.621371, from: 'km', to: 'miles' },
  mi_km: { factor: 1.60934, from: 'miles', to: 'km' },
  kg_lb: { factor: 2.20462, from: 'kg', to: 'lbs' },
  lb_kg: { factor: 0.453592, from: 'lbs', to: 'kg' },
  c_f: { calc: (v) => (v * 9/5) + 32, from: '°C', to: '°F' },
  f_c: { calc: (v) => (v - 32) * 5/9, from: '°F', to: '°C' },
  m_ft: { factor: 3.28084, from: 'm', to: 'ft' },
  ft_m: { factor: 0.3048, from: 'ft', to: 'm' },
  l_gal: { factor: 0.264172, from: 'liters', to: 'gallons' },
  gal_l: { factor: 3.78541, from: 'gallons', to: 'liters' },
  cm_in: { factor: 0.393701, from: 'cm', to: 'inches' },
  in_cm: { factor: 2.54, from: 'inches', to: 'cm' },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('convert')
    .setDescription('Convert between units')
    .addNumberOption(o => o.setName('amount').setDescription('Amount to convert').setRequired(true))
    .addStringOption(o => o.setName('conversion').setDescription('Conversion type').setRequired(true).addChoices(
      { name: 'km → miles', value: 'km_mi' },
      { name: 'miles → km', value: 'mi_km' },
      { name: 'kg → lbs', value: 'kg_lb' },
      { name: 'lbs → kg', value: 'lb_kg' },
      { name: '°C → °F', value: 'c_f' },
      { name: '°F → °C', value: 'f_c' },
      { name: 'm → ft', value: 'm_ft' },
      { name: 'ft → m', value: 'ft_m' },
      { name: 'L → gal', value: 'l_gal' },
      { name: 'gal → L', value: 'gal_l' },
      { name: 'cm → in', value: 'cm_in' },
      { name: 'in → cm', value: 'in_cm' },
    )),
  async execute(interaction) {
    const amount = interaction.options.getNumber('amount');
    const type = interaction.options.getString('conversion');
    const conv = CONVERSIONS[type];
    const result = conv.calc ? conv.calc(amount) : amount * conv.factor;
    await interaction.reply({
      embeds: [embed('success')
        .setTitle('🔄 Unit Converter')
        .setDescription(`**${amount}** ${conv.from} = **${result.toFixed(2)}** ${conv.to}`)],
    });
  },
};
