const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database');
const { embed, errorEmbed } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption(o => o.setName('question').setDescription('Poll question').setRequired(true))
    .addStringOption(o => o.setName('option1').setDescription('Option 1').setRequired(true))
    .addStringOption(o => o.setName('option2').setDescription('Option 2').setRequired(true))
    .addStringOption(o => o.setName('option3').setDescription('Option 3'))
    .addStringOption(o => o.setName('option4').setDescription('Option 4')),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = [];
    for (let i = 1; i <= 4; i++) {
      const opt = interaction.options.getString(`option${i}`);
      if (opt) options.push(opt);
    }

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
    const desc = options.map((o, i) => `${emojis[i]} ${o}`).join('\n\n');
    const e = embed('info').setTitle(`📊 ${question}`).setDescription(desc).setFooter({ text: 'Click a button to vote!' });

    const row = new ActionRowBuilder();
    options.forEach((o, i) => {
      row.addComponents(new ButtonBuilder().setCustomId(`poll_${i}`).setLabel(o).setEmoji(emojis[i]).setStyle(ButtonStyle.Secondary));
    });

    const msg = await interaction.channel.send({ embeds: [e], components: [row] });
    db.addPoll(interaction.guild.id, interaction.channel.id, msg.id, question, options);
    await interaction.reply({ content: '📊 Poll created!', ephemeral: true });
  },
};
