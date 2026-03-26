const db = require('../database');
const { embed } = require('../utils/helpers');

// In-memory rate tracking for anti-spam
const messageRates = new Map(); // guildId:userId -> [timestamps]
const URL_REGEX = /https?:\/\/[^\s]+/gi;
const PHISHING_DOMAINS = ['discord.gift', 'discordgift.com', 'steamcommunity.link', 'dicsord.com', 'discorcl.com', 'dlscord.com'];

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;
    const guildId = message.guild.id;
    const userId = message.author.id;

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
