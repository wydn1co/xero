const { errorEmbed } = require('../utils/helpers');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // ── Slash commands ────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      // Cooldowns
      const { cooldowns } = client;
      if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Map());
      const timestamps = cooldowns.get(command.data.name);
      const cooldownAmount = (command.cooldown || 3) * 1000;
      if (timestamps.has(interaction.user.id)) {
        const expiration = timestamps.get(interaction.user.id) + cooldownAmount;
        if (Date.now() < expiration) {
          const remaining = ((expiration - Date.now()) / 1000).toFixed(1);
          return interaction.reply({ embeds: [errorEmbed(`Please wait ${remaining}s before using this again.`)], ephemeral: true });
        }
      }
      timestamps.set(interaction.user.id, Date.now());
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        const reply = { embeds: [errorEmbed('An error occurred while executing this command.')], ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
        else await interaction.reply(reply);
      }
    }

    // ── Buttons ────────────────────────────────────────────
    if (interaction.isButton()) {
      // Poll voting
      if (interaction.customId.startsWith('poll_')) {
        const db = require('../database');
        const poll = db.getPoll(interaction.message.id);
        if (!poll) return;
        const optionIndex = parseInt(interaction.customId.split('_')[1]);
        const votes = JSON.parse(poll.votes);
        // Remove previous vote
        for (const key of Object.keys(votes)) {
          votes[key] = (votes[key] || []).filter(id => id !== interaction.user.id);
        }
        // Add new vote
        if (!votes[optionIndex]) votes[optionIndex] = [];
        votes[optionIndex].push(interaction.user.id);
        db.updatePollVotes(interaction.message.id, votes);
        await interaction.reply({ content: `✅ Vote recorded!`, ephemeral: true });
      }

      // Giveaway entry
      if (interaction.customId === 'giveaway_enter') {
        await interaction.reply({ content: '🎉 You have entered the giveaway!', ephemeral: true });
      }
    }
  },
};
