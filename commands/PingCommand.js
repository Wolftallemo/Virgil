module.exports = {
  name: 'ping',
  properName: 'Ping',
  description: 'Pong',
  async execute (message) {
    const beginningTS = Date.now()
    const ping = await message.channel.send(':bulb: Checking...')
    const db = require('../database')
    await db.query('SELECT * FROM core_settings WHERE guild_id = $1', [message.guild.id])
    ping.edit(`WebSocket: ${message.client.ws.ping}ms\nMessage Latency: ${Date.now() - ping.createdTimestamp}ms\nRound Trip: ${Date.now() - beginningTS}ms`)
  }
}
