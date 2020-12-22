const config = require('../config.json')
const db = require('../database')

module.exports = {
  name: 'appealban',
  description: 'Bans a user from the appeal form',
  guildOnly: true,
  async execute (message, args) {
    if (!message.member.roles.cache.some(role => config.appealsManagerRole.includes(role.id))) {
      return message.channel.send('You do not have permission to run this command!')
    }
    if (!args[0]) return message.channel.send('You did not specify a user!')
    try {
      const user = await db.query('SELECT * FROM auth WHERE discord_id = $1;', [args[0]])
      if (user.rowCount === 0) {
        await db.query('INSERT INTO auth(discord_id,email,username,discriminator,blocked) VALUES($1,$2,$3,$4,$5);', [args[0], 'removed', 'unknown', '0000', true])
      }
      await db.query('UPDATE auth SET blocked = true WHERE discord_id = $1;', [args[0]])
      message.channel.send('User has been banned from the form!')
    } catch (e) {
      console.error(e)
      return message.channel.send(`I could not complete the request! ${e}`)
    }
  }
}
