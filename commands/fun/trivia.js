const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../utils/helpers');

const TRIVIA = [
  { q: 'What planet is known as the Red Planet?', a: 'Mars', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'] },
  { q: 'What is the largest ocean on Earth?', a: 'Pacific', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'] },
  { q: 'Who painted the Mona Lisa?', a: 'Leonardo da Vinci', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'] },
  { q: 'What year did the Titanic sink?', a: '1912', options: ['1905', '1912', '1920', '1898'] },
  { q: 'What is the chemical symbol for gold?', a: 'Au', options: ['Go', 'Gd', 'Au', 'Ag'] },
  { q: 'How many continents are there?', a: '7', options: ['5', '6', '7', '8'] },
  { q: 'What is the smallest country in the world?', a: 'Vatican City', options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'] },
  { q: 'What gas do plants absorb from the atmosphere?', a: 'Carbon dioxide', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'] },
  { q: 'What is the speed of light?', a: '299,792 km/s', options: ['150,000 km/s', '299,792 km/s', '500,000 km/s', '100,000 km/s'] },
  { q: 'Which element has the atomic number 1?', a: 'Hydrogen', options: ['Helium', 'Hydrogen', 'Lithium', 'Carbon'] },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Answer a trivia question'),
  async execute(interaction) {
    const t = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
    const shuffled = [...t.options].sort(() => Math.random() - 0.5);
    const desc = shuffled.map((o, i) => `**${i + 1}.** ${o}`).join('\n');

    await interaction.reply({
      embeds: [embed('info').setTitle('🧠 Trivia').setDescription(`${t.q}\n\n${desc}\n\nType the number of your answer within 15 seconds.`)],
    });

    const filter = (m) => m.author.id === interaction.user.id;
    try {
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });
      const num = parseInt(collected.first().content) - 1;
      if (shuffled[num] === t.a) {
        const db = require('../../database');
        const eco = db.getEconomy(interaction.guild.id, interaction.user.id);
        db.setEconomy(interaction.guild.id, interaction.user.id, eco.balance + 50, eco.last_daily);
        await interaction.followUp({ embeds: [embed('success').setDescription(`✅ Correct! The answer is **${t.a}**. You earned 🪙 **50** coins!`)] });
      } else {
        await interaction.followUp({ embeds: [embed('error').setDescription(`❌ Wrong! The correct answer was **${t.a}**.`)] });
      }
    } catch (e) {
      await interaction.followUp({ embeds: [embed('warn').setDescription(`⏰ Time's up! The correct answer was **${t.a}**.`)] });
    }
  },
};
