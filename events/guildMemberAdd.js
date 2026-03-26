const db = require('../database');
const { embed } = require('../utils/helpers');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const guildId = member.guild.id;

    // ── Auto-role ───────────────────────────────────────────
    const autoRoleId = db.get(guildId, 'auto_role');
    if (autoRoleId) {
      try { await member.roles.add(autoRoleId); } catch (e) {}
    }

    // ── Welcome message ─────────────────────────────────────
    const welcomeMsg = db.get(guildId, 'welcome_message');
    const welcomeChannel = db.get(guildId, 'welcome_channel');
    if (welcomeMsg && welcomeChannel) {
      try {
        const channel = await member.guild.channels.fetch(welcomeChannel);
        if (channel) {
          const msg = welcomeMsg
            .replace('{user}', `<@${member.id}>`)
            .replace('{server}', member.guild.name)
            .replace('{membercount}', member.guild.memberCount);
          await channel.send({
            embeds: [embed('success')
              .setTitle('👋 Welcome!')
              .setDescription(msg)
              .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))],
          });
        }
      } catch (e) {}
    }

    // ── Anti-alt detection ──────────────────────────────────
    const antiAlt = db.get(guildId, 'antialt');
    if (antiAlt === 'on') {
      const accountAge = Date.now() - member.user.createdTimestamp;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (accountAge < sevenDays) {
        const logChannelId = db.get(guildId, 'log_channel');
        if (logChannelId) {
          try {
            const channel = await member.guild.channels.fetch(logChannelId);
            if (channel) {
              await channel.send({
                embeds: [embed('warn')
                  .setTitle('⚠️ Potential Alt Account Detected')
                  .setDescription(`**User:** <@${member.id}> (${member.user.tag})\n**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n**Account Age:** ${Math.floor(accountAge / (1000 * 60 * 60))} hours`)],
              });
            }
          } catch (e) {}
        }
      }
    }
  },
};
