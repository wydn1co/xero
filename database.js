const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'bot.db');

let db = null;

function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDatabase() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA foreign_keys = ON');

  db.run(`CREATE TABLE IF NOT EXISTS settings (
    guild_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    PRIMARY KEY (guild_id, key)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    action TEXT NOT NULL,
    reason TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS economy (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    balance INTEGER DEFAULT 0,
    last_daily TEXT,
    PRIMARY KEY (guild_id, user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS xp (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS giveaways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT,
    prize TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    ended INTEGER DEFAULT 0,
    winner_id TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS custom_commands (
    guild_id TEXT NOT NULL,
    name TEXT NOT NULL,
    response TEXT NOT NULL,
    PRIMARY KEY (guild_id, name)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message TEXT NOT NULL,
    remind_at TEXT NOT NULL,
    sent INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS blacklisted_words (
    guild_id TEXT NOT NULL,
    word TEXT NOT NULL,
    PRIMARY KEY (guild_id, word)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS whitelisted_links (
    guild_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    PRIMARY KEY (guild_id, domain)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reaction_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    emoji TEXT NOT NULL,
    role_id TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS jail (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    roles TEXT NOT NULL,
    PRIMARY KEY (guild_id, user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS polls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    votes TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS shop_items (
    guild_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    PRIMARY KEY (guild_id, name)
  )`);

  save();
  return db;
}

// ── Query Helpers ───────────────────────────────────────────────

function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function runSql(sql, params = []) {
  db.run(sql, params);
  save();
}

// ── Settings ────────────────────────────────────────────────────

function get(guildId, key) {
  const row = queryOne('SELECT value FROM settings WHERE guild_id = ? AND key = ?', [guildId, key]);
  return row ? row.value : null;
}

function set(guildId, key, value) {
  runSql('INSERT OR REPLACE INTO settings (guild_id, key, value) VALUES (?, ?, ?)', [guildId, key, String(value)]);
}

// ── Warnings ────────────────────────────────────────────────────

function addWarning(guildId, userId, modId, reason) {
  runSql('INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)', [guildId, userId, modId, reason]);
}

function getWarnings(guildId, userId) {
  return queryAll('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC', [guildId, userId]);
}

function clearWarnings(guildId, userId) {
  runSql('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
}

// ── Cases ───────────────────────────────────────────────────────

function addCase(guildId, userId, modId, action, reason) {
  runSql('INSERT INTO cases (guild_id, user_id, moderator_id, action, reason) VALUES (?, ?, ?, ?, ?)', [guildId, userId, modId, action, reason]);
}

function getCases(guildId) {
  return queryAll('SELECT * FROM cases WHERE guild_id = ? ORDER BY created_at DESC LIMIT 25', [guildId]);
}

function getCasesForUser(guildId, userId) {
  return queryAll('SELECT * FROM cases WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC', [guildId, userId]);
}

// ── Economy ─────────────────────────────────────────────────────

function getEconomy(guildId, userId) {
  let row = queryOne('SELECT * FROM economy WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
  if (!row) {
    runSql('INSERT INTO economy (guild_id, user_id, balance, last_daily) VALUES (?, ?, 0, NULL)', [guildId, userId]);
    row = { balance: 0, last_daily: null };
  }
  return row;
}

function setEconomy(guildId, userId, balance, lastDaily) {
  runSql('INSERT OR REPLACE INTO economy (guild_id, user_id, balance, last_daily) VALUES (?, ?, ?, ?)', [guildId, userId, balance, lastDaily]);
}

function getTopEconomy(guildId) {
  return queryAll('SELECT * FROM economy WHERE guild_id = ? ORDER BY balance DESC LIMIT 10', [guildId]);
}

// ── XP ──────────────────────────────────────────────────────────

function getXP(guildId, userId) {
  let row = queryOne('SELECT * FROM xp WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
  if (!row) {
    runSql('INSERT INTO xp (guild_id, user_id, xp, level) VALUES (?, ?, 0, 0)', [guildId, userId]);
    row = { xp: 0, level: 0 };
  }
  return row;
}

function setXP(guildId, userId, xp, level) {
  runSql('INSERT OR REPLACE INTO xp (guild_id, user_id, xp, level) VALUES (?, ?, ?, ?)', [guildId, userId, xp, level]);
}

function getTopXP(guildId) {
  return queryAll('SELECT * FROM xp WHERE guild_id = ? ORDER BY level DESC, xp DESC LIMIT 10', [guildId]);
}

// ── Inventory ───────────────────────────────────────────────────

function getInventory(guildId, userId) {
  return queryAll('SELECT * FROM inventory WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
}

function addInventoryItem(guildId, userId, item, qty) {
  const existing = queryOne('SELECT * FROM inventory WHERE guild_id = ? AND user_id = ? AND item_name = ?', [guildId, userId, item]);
  if (existing) {
    runSql('UPDATE inventory SET quantity = ? WHERE guild_id = ? AND user_id = ? AND item_name = ?', [existing.quantity + qty, guildId, userId, item]);
  } else {
    runSql('INSERT INTO inventory (guild_id, user_id, item_name, quantity) VALUES (?, ?, ?, ?)', [guildId, userId, item, qty]);
  }
}

function removeInventoryItem(guildId, userId, item, qty) {
  const existing = queryOne('SELECT * FROM inventory WHERE guild_id = ? AND user_id = ? AND item_name = ?', [guildId, userId, item]);
  if (!existing || existing.quantity < qty) return false;
  if (existing.quantity === qty) runSql('DELETE FROM inventory WHERE guild_id = ? AND user_id = ? AND item_name = ?', [guildId, userId, item]);
  else runSql('UPDATE inventory SET quantity = ? WHERE guild_id = ? AND user_id = ? AND item_name = ?', [existing.quantity - qty, guildId, userId, item]);
  return true;
}

// ── Custom Commands ─────────────────────────────────────────────

function getCustomCommand(guildId, name) {
  return queryOne('SELECT * FROM custom_commands WHERE guild_id = ? AND name = ?', [guildId, name]);
}

function setCustomCommand(guildId, name, response) {
  runSql('INSERT OR REPLACE INTO custom_commands (guild_id, name, response) VALUES (?, ?, ?)', [guildId, name, response]);
}

function deleteCustomCommand(guildId, name) {
  runSql('DELETE FROM custom_commands WHERE guild_id = ? AND name = ?', [guildId, name]);
}

// ── Blacklisted Words ───────────────────────────────────────────

function getBlacklist(guildId) {
  return queryAll('SELECT word FROM blacklisted_words WHERE guild_id = ?', [guildId]).map(r => r.word);
}

function addBlacklistWord(guildId, word) {
  runSql('INSERT OR IGNORE INTO blacklisted_words (guild_id, word) VALUES (?, ?)', [guildId, word.toLowerCase()]);
}

// ── Whitelisted Links ───────────────────────────────────────────

function getWhitelist(guildId) {
  return queryAll('SELECT domain FROM whitelisted_links WHERE guild_id = ?', [guildId]).map(r => r.domain);
}

function addWhitelistLink(guildId, domain) {
  runSql('INSERT OR IGNORE INTO whitelisted_links (guild_id, domain) VALUES (?, ?)', [guildId, domain.toLowerCase()]);
}

// ── Reminders ───────────────────────────────────────────────────

function addReminder(userId, channelId, message, remindAt) {
  runSql('INSERT INTO reminders (user_id, channel_id, message, remind_at) VALUES (?, ?, ?, ?)', [userId, channelId, message, remindAt]);
}

function getPendingReminders() {
  return queryAll("SELECT * FROM reminders WHERE sent = 0 AND remind_at <= datetime('now')");
}

function markReminderSent(id) {
  runSql('UPDATE reminders SET sent = 1 WHERE id = ?', [id]);
}

// ── Jail ────────────────────────────────────────────────────────

function getJail(guildId, userId) {
  return queryOne('SELECT * FROM jail WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
}

function addJail(guildId, userId, roles) {
  runSql('INSERT OR REPLACE INTO jail (guild_id, user_id, roles) VALUES (?, ?, ?)', [guildId, userId, JSON.stringify(roles)]);
}

function removeJail(guildId, userId) {
  runSql('DELETE FROM jail WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
}

// ── Giveaways ───────────────────────────────────────────────────

function addGiveaway(guildId, channelId, messageId, prize, endsAt) {
  runSql('INSERT INTO giveaways (guild_id, channel_id, message_id, prize, ends_at) VALUES (?, ?, ?, ?, ?)', [guildId, channelId, messageId, prize, endsAt]);
  return { lastInsertRowid: queryOne('SELECT last_insert_rowid() as id').id };
}

function getActiveGiveaways() {
  return queryAll("SELECT * FROM giveaways WHERE ended = 0 AND ends_at <= datetime('now')");
}

function endGiveaway(id, winnerId) {
  runSql('UPDATE giveaways SET ended = 1, winner_id = ? WHERE id = ?', [winnerId, id]);
}

function getGiveaway(id) {
  return queryOne('SELECT * FROM giveaways WHERE id = ?', [id]);
}

function getGiveawayByMessage(msgId) {
  return queryOne('SELECT * FROM giveaways WHERE message_id = ?', [msgId]);
}

// ── Reaction Roles ──────────────────────────────────────────────

function addReactionRole(guildId, channelId, messageId, emoji, roleId) {
  runSql('INSERT INTO reaction_roles (guild_id, channel_id, message_id, emoji, role_id) VALUES (?, ?, ?, ?, ?)', [guildId, channelId, messageId, emoji, roleId]);
}

function getReactionRoles(messageId) {
  return queryAll('SELECT * FROM reaction_roles WHERE message_id = ?', [messageId]);
}

// ── Polls ───────────────────────────────────────────────────────

function addPoll(guildId, channelId, messageId, question, options) {
  runSql('INSERT INTO polls (guild_id, channel_id, message_id, question, options) VALUES (?, ?, ?, ?, ?)', [guildId, channelId, messageId, question, JSON.stringify(options)]);
}

function getPoll(messageId) {
  return queryOne('SELECT * FROM polls WHERE message_id = ?', [messageId]);
}

function updatePollVotes(messageId, votes) {
  runSql('UPDATE polls SET votes = ? WHERE message_id = ?', [JSON.stringify(votes), messageId]);
}

// ── Shop ────────────────────────────────────────────────────────

function getShop(guildId) {
  return queryAll('SELECT * FROM shop_items WHERE guild_id = ?', [guildId]);
}

function getShopItem(guildId, name) {
  return queryOne('SELECT * FROM shop_items WHERE guild_id = ? AND name = ?', [guildId, name]);
}

// ── Exports ─────────────────────────────────────────────────────

module.exports = {
  initDatabase, get, set,
  addWarning, getWarnings, clearWarnings,
  addCase, getCases, getCasesForUser,
  getEconomy, setEconomy, getTopEconomy,
  getXP, setXP, getTopXP,
  getInventory, addInventoryItem, removeInventoryItem,
  getCustomCommand, setCustomCommand, deleteCustomCommand,
  getBlacklist, addBlacklistWord,
  getWhitelist, addWhitelistLink,
  addReminder, getPendingReminders, markReminderSent,
  getJail, addJail, removeJail,
  addGiveaway, getActiveGiveaways, endGiveaway, getGiveaway, getGiveawayByMessage,
  addReactionRole, getReactionRoles,
  addPoll, getPoll, updatePollVotes,
  getShop, getShopItem,
};
