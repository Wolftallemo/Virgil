const db = require('../database')
const Discord = require('discord.js')

module.exports = {
  name: 'warn',
  description: 'Issues a warning to a member',
  guildOnly: true,
  execute (message, args) {
    const { moderatorRoles, owner, permissionOverrideRoles } = require(`../serversettings/${message.guild.id}.json`)
    const reason = args.slice(1).join(' ')
    let member
    if (member.match(/(^<@!?[0-9]*>)/)) {
      member = message.mentions.members.first().id
    } else {
      member = message.guild.members.fetch(args[0]).id
    }
    if (!member) return message.channel.send('I could not find this user!')
    if (!reason) return message.channel.send('Gimme a reason first dammit.')
    if (member.roles.cache) {
      if (member.roles.cache.find(role => moderatorRoles.includes(role.id))) return message.channel.send('I cannot warn moderators.')
    }
    if (!message.member.roles.cache.find(role => moderatorRoles.includes(role.id))) return message.channel.send
    if (member == owner) return message.channel.send('I cannot warn my creator.')
    const makeWarnVals = [Date.now(), message.author.id, member, reason, 'warn', message.guild.id, 'f']
    const embed = new Discord.MessageEmbed()
      .setColor(3756250)
    db.query('INSERT INTO punishments(time,moderator,target,reason,type,server,deleted) VALUES($1,$2,$3,$4,$5,$6,$7);', makeWarnVals, 'f')
      .catch(e => console.error(e => console.error(e.stack)))
    member.send(`You have been warned in ${guild.name} for **${reason}**`).catch(() => {
      embed.setDescription(':x: I could not DM them.')
      return message.channel.send(embed)
    })
    embed.setDescription(`${member.user.tag} was warned | ${reason}`)
    return message.channel.send(embed)
  }
}
