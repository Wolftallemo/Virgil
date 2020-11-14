const { owner } = require('../config.json')
module.exports = {
    name: 'exit',
    description: 'Exits the bot process',
    execute(message) {
        if (message.author.id == owner) {
            process.exit()
        }
        else {
            return message.channel.send('You tried.')
        }
    }
}