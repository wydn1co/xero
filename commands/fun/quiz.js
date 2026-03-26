const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../utils/helpers');

const QUIZZES = [
  { q: 'What does HTML stand for?', a: 'HyperText Markup Language' },
  { q: 'What does CPU stand for?', a: 'Central Processing Unit' },
  { q: 'What year was JavaScript created?', a: '1995' },
  { q: 'Who created Linux?', a: 'Linus Torvalds' },
  { q: 'What does RAM stand for?', a: 'Random Access Memory' },
  { q: 'What is the binary representation of 10?', a: '1010' },
  { q: 'What does API stand for?', a: 'Application Programming Interface' },
  { q: 'What language is Discord bots commonly written in?', a: 'JavaScript' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Take a random quiz'),
  async execute(interaction) {
    const quiz = QUIZZES[Math.floor(Math.random() * QUIZZES.length)];
    await interaction.reply({ embeds: [embed('info').setTitle('📝 Quiz').setDescription(`${quiz.q}\n\nType your answer within 20 seconds.`)] });
    const filter = (m) => m.author.id === interaction.user.id;
    try {
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 20000, errors: ['time'] });
      const answer = collected.first().content.toLowerCase().trim();
      if (answer === quiz.a.toLowerCase()) {
        await interaction.followUp({ embeds: [embed('success').setDescription(`✅ Correct! The answer is **${quiz.a}**.`)] });
      } else {
        await interaction.followUp({ embeds: [embed('error').setDescription(`❌ Wrong! The correct answer was **${quiz.a}**.`)] });
      }
    } catch (e) {
      await interaction.followUp({ embeds: [embed('warn').setDescription(`⏰ Time's up! The correct answer was **${quiz.a}**.`)] });
    }
  },
};
