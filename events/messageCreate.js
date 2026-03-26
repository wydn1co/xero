const db = require('../database');
const { embed } = require('../utils/helpers');

// In-memory rate tracking for anti-spam
const messageRates = new Map(); // guildId:userId -> [timestamps]
const URL_REGEX = /https?:\/\/[^\s]+/gi;
const PHISHING_DOMAINS = ['discord.gift', 'discordgift.com', 'steamcommunity.link', 'dicsord.com', 'discorcl.com', 'dlscord.com'];

const PREFIX = '.';

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;
    const guildId = message.guild.id;
    const userId = message.author.id;

    // ── Prefix commands (.command) ──────────────────────────
    if (message.content.startsWith(PREFIX)) {
      const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;

      const command = client.commands.get(commandName);
      if (!command) return;

      // Parse mentions and strings from args
      const mentionedUsers = message.mentions.users;
      const mentionedMembers = message.mentions.members;
      const mentionedChannels = message.mentions.channels;
      const mentionedRoles = message.mentions.roles;
      let userArgIndex = 0;
      let channelArgIndex = 0;
      let roleArgIndex = 0;

      // Build a fake interaction object
      const fakeInteraction = {
        guild: message.guild,
        channel: message.channel,
        member: message.member,
        user: message.author,
        client: client,
        commandName: commandName,
        replied: false,
        deferred: false,
        createdTimestamp: message.createdTimestamp,
        isChatInputCommand: () => true,
        isButton: () => false,

        options: {
          getUser: (name) => {
            const u = mentionedUsers?.at(userArgIndex);
            if (u) { userArgIndex++; return u; }
            return null;
          },
          getMember: (name) => {
            const m = mentionedMembers?.at(userArgIndex);
            return m || null;
          },
          getString: (name) => {
            // For "reason" or similar, join remaining non-mention args
            const nonMentionArgs = args.filter(a => !a.match(/^<[@#&!]+\d+>$/));
            return nonMentionArgs.length > 0 ? nonMentionArgs.join(' ') : null;
          },
          getInteger: (name) => {
            const num = args.find(a => !isNaN(a) && !a.match(/^<[@#&!]+\d+>$/));
            return num ? parseInt(num) : null;
          },
          getNumber: (name) => {
            const num = args.find(a => !isNaN(a) && !a.match(/^<[@#&!]+\d+>$/));
            return num ? parseFloat(num) : null;
          },
          getBoolean: (name) => {
            const val = args.find(a => a === 'true' || a === 'false');
            return val ? val === 'true' : null;
          },
          getChannel: (name) => {
            const c = mentionedChannels?.at(channelArgIndex);
            if (c) { channelArgIndex++; return c; }
            return null;
          },
          getRole: (name) => {
            const r = mentionedRoles?.at(roleArgIndex);
            if (r) { roleArgIndex++; return r; }
            return null;
          },
          getSubcommand: () => args[0] || null,
        },

        reply: async (data) => {
          fakeInteraction.replied = true;
          if (typeof data === 'string') return message.channel.send(data);
          // Remove ephemeral since we can't do that with normal messages
          const { ephemeral, fetchReply, flags, ...rest } = (typeof data === 'object' ? data : { content: data });
          const sent = await message.channel.send(rest);
          fakeInteraction._lastReply = sent;
          return sent;
        },
        editReply: async (data) => {
          if (fakeInteraction._lastReply) {
            if (typeof data === 'string') return fakeInteraction._lastReply.edit({ content: data });
            const { ephemeral, fetchReply, flags, ...rest } = (typeof data === 'object' ? data : { content: data });
            return fakeInteraction._lastReply.edit(rest);
          }
          return message.channel.send(typeof data === 'string' ? data : data);
        },
        followUp: async (data) => {
          if (typeof data === 'string') return message.channel.send(data);
          const { ephemeral, flags, ...rest } = (typeof data === 'object' ? data : { content: data });
          return message.channel.send(rest);
        },
        deferReply: async () => {
          fakeInteraction.deferred = true;
          fakeInteraction._lastReply = await message.channel.send('⏳ Processing...');
        },
      };

      try {
        await command.execute(fakeInteraction, client);
      } catch (error) {
        console.error(`Error executing prefix command ${commandName}:`, error);
        message.channel.send('❌ An error occurred while executing this command.').catch(() => {});
      }
      return; // Don't process security/XP for prefix commands
    }

    // ── Blacklisted words ───────────────────────────────────
    const blacklist = db.getBlacklist(guildId);
    if (blacklist.length > 0) {
      const content = message.content.toLowerCase();
      if (blacklist.some(w => content.includes(w))) {
        try { await message.delete(); } catch (e) {}
        try { await message.author.send({ embeds: [embed('warn').setDescription('Your message was removed because it contained a blacklisted word.')] }); } catch (e) {}
        return;
      }
    }

    // ── Anti-link ───────────────────────────────────────────
    const antiLink = db.get(guildId, 'antilink');
    if (antiLink === 'on' && !message.member.permissions.has('ManageMessages')) {
      const urls = message.content.match(URL_REGEX);
      if (urls) {
        const whitelist = db.getWhitelist(guildId);
        const allWhitelisted = urls.every(url => {
          try { const domain = new URL(url).hostname; return whitelist.some(w => domain.includes(w)); } catch { return false; }
        });
        if (!allWhitelisted) {
          try { await message.delete(); } catch (e) {}
          try { await message.channel.send({ content: `<@${userId}>, links are not allowed in this channel.` }); } catch (e) {}
          return;
        }
      }
    }

    // ── Anti-phish ──────────────────────────────────────────
    const antiPhish = db.get(guildId, 'antiphish');
    if (antiPhish === 'on') {
      const urls = message.content.match(URL_REGEX);
      if (urls) {
        const isPhishing = urls.some(url => {
          try { const domain = new URL(url).hostname; return PHISHING_DOMAINS.some(p => domain.includes(p)); } catch { return false; }
        });
        if (isPhishing) {
          try { await message.delete(); } catch (e) {}
          try {
            await message.channel.send({ embeds: [embed('error').setDescription(`⚠️ <@${userId}>, a phishing link was detected and removed.`)] });
          } catch (e) {}
          return;
        }
      }
    }

    // ── Anti-mention ────────────────────────────────────────
    const antiMention = db.get(guildId, 'antimention');
    if (antiMention === 'on' && !message.member.permissions.has('ManageMessages')) {
      if (message.mentions.users.size >= 5 || message.mentions.roles.size >= 3) {
        try { await message.delete(); } catch (e) {}
        try { await message.channel.send({ content: `<@${userId}>, mass mentions are not allowed.` }); } catch (e) {}
        return;
      }
    }

    // ── Anti-spam ───────────────────────────────────────────
    const antiSpam = db.get(guildId, 'antispam');
    if (antiSpam === 'on' && !message.member.permissions.has('ManageMessages')) {
      const key = `${guildId}:${userId}`;
      if (!messageRates.has(key)) messageRates.set(key, []);
      const timestamps = messageRates.get(key);
      timestamps.push(Date.now());
      // Keep only last 5 seconds
      const cutoff = Date.now() - 5000;
      const recent = timestamps.filter(t => t > cutoff);
      messageRates.set(key, recent);
      if (recent.length >= 5) {
        try {
          await message.member.timeout(60000, 'Anti-spam: too many messages');
          await message.channel.send({ embeds: [embed('warn').setDescription(`<@${userId}> has been muted for 1 minute (spam detected).`)] });
        } catch (e) {}
        messageRates.delete(key);
        return;
      }
    }

    // ── XP System ───────────────────────────────────────────
    const xpData = db.getXP(guildId, userId);
    const xpGain = Math.floor(Math.random() * 10) + 5;
    const newXp = xpData.xp + xpGain;
    const xpForNextLevel = (xpData.level + 1) * 100;
    if (newXp >= xpForNextLevel) {
      const newLevel = xpData.level + 1;
      db.setXP(guildId, userId, newXp - xpForNextLevel, newLevel);
      try {
        await message.channel.send({ embeds: [embed('success').setDescription(`🎉 <@${userId}> leveled up to **Level ${newLevel}**!`)] });
      } catch (e) {}
    } else {
      db.setXP(guildId, userId, newXp, xpData.level);
    }
  },
};
