const db = require('../database');
const { embed } = require('../utils/helpers');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const guildId = member.guild.id;

    const farewellMsg = db.get(guildId, 'farewell_message');
    const farewellChannel = db.get(guildId, 'farewell_channel') || db.get(guildId, 'welcome_channel');
    if (farewellMsg && farewellChannel) {
      try {
        const channel = await member.guild.channels.fetch(farewellChannel);
        if (channel) {
          const msg = farewellMsg
            .replace('{user}', member.user.tag)
            .replace('{server}', member.guild.name)
            .replace('{membercount}', member.guild.memberCount);
          await channel.send({
            embeds: [embed('error')
              .setTitle('👋 Goodbye')
              .setDescription(msg)
              .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))],
          });
        }
      } catch (e) {}
    }
  },
};
