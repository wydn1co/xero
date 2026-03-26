require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const db = require('./database');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.GuildMember],
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.startedAt = Date.now();

// ── Load commands ─────────────────────────────────────────────────
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, 'commands', folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;
  const cmdFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
  for (const file of cmdFiles) {
    const command = require(path.join(folderPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}

// ── Load events ───────────────────────────────────────────────────
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(path.join(__dirname, 'events', file));
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
}

// ── Start bot ─────────────────────────────────────────────────────
async function start() {
  await db.initDatabase();
  console.log('✅ Database initialized');

  // Reminder & Giveaway timer
  setInterval(async () => {
    // Reminders
    const reminders = db.getPendingReminders();
    for (const r of reminders) {
      try {
        const channel = await client.channels.fetch(r.channel_id);
        if (channel) await channel.send(`⏰ <@${r.user_id}> Reminder: **${r.message}**`);
        db.markReminderSent(r.id);
      } catch (e) { db.markReminderSent(r.id); }
    }

    // Giveaways
    const giveaways = db.getActiveGiveaways();
    for (const g of giveaways) {
      try {
        const channel = await client.channels.fetch(g.channel_id);
        if (!channel) { db.endGiveaway(g.id, null); continue; }
        const message = await channel.messages.fetch(g.message_id);
        if (!message) { db.endGiveaway(g.id, null); continue; }
        const reaction = message.reactions.cache.get('🎉');
        if (!reaction) { db.endGiveaway(g.id, null); continue; }
        const users = await reaction.users.fetch();
        const eligible = users.filter(u => !u.bot);
        if (eligible.size === 0) {
          db.endGiveaway(g.id, null);
          await channel.send({ content: `🎉 Giveaway for **${g.prize}** ended, but nobody entered!` });
        } else {
          const winner = eligible.random();
          db.endGiveaway(g.id, winner.id);
          await channel.send({ content: `🎉 Congratulations <@${winner.id}>! You won **${g.prize}**!` });
        }
      } catch (e) { db.endGiveaway(g.id, null); }
    }
  }, 15000);

  await client.login(process.env.DISCORD_TOKEN);
}

start().catch(err => { console.error('❌ Failed to start bot:', err); process.exit(1); });
