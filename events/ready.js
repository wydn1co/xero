module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}!`);
    console.log(`📦 ${client.commands.size} commands loaded`);
    console.log(`🏠 Serving ${client.guilds.cache.size} guilds`);
    client.user.setActivity('/ commands | Protecting your server', { type: 3 });
  },
};
