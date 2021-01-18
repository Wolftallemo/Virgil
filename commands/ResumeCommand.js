module.exports = {
  name: 'resume',
  description: 'Resumes audio',
  guildOnly: true,
  async execute (message) {
    const { dispatcher } = require('./PlayCommand')
    if (!dispatcher) return message.channel.send('Nothing currently playing.')
    if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send('You do not have the permissions required to pause the player.')
    dispatcher.resume()
    return message.channel.send('Player is resumed.')
  }
}
