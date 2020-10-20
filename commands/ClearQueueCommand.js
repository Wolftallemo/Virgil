const { MessageReaction } = require('discord.js')
const db = require('../database')

module.exports = {
    name: "clearqueue",
    description: "Clears music queue",
    async execute(message) {
        db.query(`DELETE FROM musicqueue WHERE guild = ${message.guild.id};`).catch(e => {
            console.error(e.stack)
            return message.channel.send(e)
        })
        return message.channel.send('Cleared music queue!')
    }
}