const fs = require('fs')
const Discord = require('discord.js')
const config = require('./config.json')
const crypto = require('crypto')
const db = require('./database')
const verifier = require('./verify')
module.exports = {
  client: new Discord.Client({ disableMentions: 'everyone', ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'DIRECT_MESSAGES'] } })
}
const client = module.exports.client
client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.name, command)
}
let lastlogtime
client.once('ready', () => {
  console.log('Virgil has started!')
})

client.on('message', async message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return
  const args = message.content.slice(config.prefix.length).trim().split(/ +/)
  const command = args.shift().toLowerCase()
  if (!client.commands.has(command)) return
  if (command.guildOnly && message.channel.type === 'dm') return
  try {
    client.commands.get(command).execute(message, args)
  } catch (error) {
    console.error(error)
  }
})

client.on('guildMemberAdd', async member => {
  try {
    const serversettings = require(`./serversettings/${member.guild.id}.json`)
    if (!serversettings.joinLogChannel) return
    const channel = member.guild.channels.cache.find(ch => ch.id === serversettings.joinLogChannel)
    const embed = new Discord.MessageEmbed()
      .setAuthor('Member Joined', member.user.displayAvatarURL())
      .setDescription(`${member} ${member.user.tag}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setColor(3756250)
      .addField('Registration Date', `${member.user.createdAt}`)
      .setFooter(`ID: ${member.id}`)
    channel.send(embed)
    const dmtext = `Thank you for joining ${member.guild.name}! Due to our security settings,`
    const secLevel = member.guild.verificationLevel
    if (secLevel === 'MEDIUM' && member.joinedTimestamp - member.user.createdTimestamp < 300000) return member.send(`${dmtext} you must wait 5 minutes befire chatting`)
    if (secLevel === 'HIGH') return member.send(`${dmtext} you must wait 10 minutes before speaking if you do not have a verified phone number, after which you may verify yourself.`).catch(() => {})
    if (secLevel === 'VERY_HIGH') return member.send(`${dmtext} you must verify your phone number before chatting. You may verify after doing so (or if you have already done so).`).catch(() => {})
    const success = await verifier.onjoin(member)
    if (success) member.send(`Thank you for joining ${member.guild.name}! You were automatically verified.`).catch(() => {})
  } catch (e) {
    console.error(e)
  }
})

client.on('guildMemberRemove', async member => {
  try {
    const serversettings = require(`./serversettings/${member.guild.id}.json`)
    if (!serversettings.joinLogChannel) return
    const channel = member.guild.channels.cache.find(ch => ch.id === serversettings.joinLogChannel)
    const embed = new Discord.MessageEmbed()
      .setAuthor('Member Left', member.user.displayAvatarURL())
      .setDescription(`${member} ${member.user.username}#${member.user.discriminator}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setColor(3756250)
      .setFooter(`ID: ${member.id}`)
    channel.send(embed)
  } catch (e) {
    console.error(e)
  }
})

client.on('guildBanAdd', async (guild, user) => {
  try {
    const serversettings = require(`./serversettings/${guild.id}.json`)
    if (!serversettings.banLogChannel) return
    const channel = guild.channels.cache.find(ch => ch.id === serversettings.banLogChannel)
    const embed = new Discord.MessageEmbed()
      .setAuthor('Member Banned', user.displayAvatarURL())
      .setDescription(`${user} ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor(3756250)
      .setFooter(`ID: ${user.id}`)
    channel.send(embed)
  } catch (e) {
    console.error(e)
  }
})

client.on('guildBanRemove', async (guild, user) => {
  try {
    const serversettings = require(`./serversettings/${guild.id}.json`)
    if (!serversettings.banLogChannel) return
    const channel = guild.channels.cache.find(ch => ch.id === serversettings.banLogChannel)
    const embed = new Discord.MessageEmbed()
      .setAuthor('Member Unbanned', user.displayAvatarURL())
      .setDescription(`${user} ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor(3756250)
      .setFooter(`ID: ${user.id}`)
    channel.send(embed)
  } catch (e) {
    console.error(e)
  }
})

client.on('messageDelete', async message => {
  if (message.channel.type === 'dm') return
  if (message.author.bot) return
  try {
    const serversettings = require(`./serversettings/${message.guild.id}.json`)
    if ((!serversettings.deleteLogChannel) || (message.author.id === client.user.id) || (serversettings.ignoredChannels.includes(message.channel.id)) || (serversettings.ignoredCategories.includes(message.channel.parent.id))) return
    const channel = message.guild.channels.cache.find(ch => ch.id === serversettings.deleteLogChannel)
    let auditlogs = await message.guild.fetchAuditLogs({ limit: 1, type: 72 })
    auditlogs = auditlogs.entries.first()
    let messagecontent = `Message ${message.id} deleted from ${message.channel}`
    if (auditlogs.createdTimestamp !== lastlogtime) {
      if (auditlogs.executor) messagecontent += `by \`${auditlogs.executor.tag}\``
      lastlogtime = auditlogs.createdTimestamp
    }
    if (message.content) {
      messagecontent += `\n**Content:** ${message.content}`
    }
    const embed = new Discord.MessageEmbed()
      .setAuthor(`${message.author.username}#${message.author.discriminator} (${message.author.id})`, message.author.displayAvatarURL())
      .setDescription(messagecontent)
      .setColor(3756250)
    if (message.attachments) {
      message.attachments.forEach(attachment => {
        embed.addField('Attachment', `[Link to Attachment](${attachment.url})`, true)
      })
    }
    channel.send(embed).catch(e => console.error(e))
  } catch (e) {
    console.error(e)
  }
})

client.on('messageUpdate', async (oldMessage, newMessage) => {
  if ((oldMessage.content) && (newMessage.content) && (newMessage.channel.type !== 'dm') && (!newMessage.author.bot) && (oldMessage.content !== newMessage.content)) {
    try {
      const serversettings = require(`./serversettings/${newMessage.guild.id}.json`)
      if ((!serversettings.editLogChannel) || (oldMessage.channel.type === 'dm') || (serversettings.ignoredChannels.includes(newMessage.channel.id)) || (serversettings.ignoredCategories.includes(newMessage.channel.parent.id))) return
      const channel = oldMessage.guild.channels.cache.find(ch => ch.id === serversettings.editLogChannel)
      const embed = new Discord.MessageEmbed()
        .setAuthor(`${oldMessage.author.username}#${oldMessage.author.discriminator} (${oldMessage.author.id})`, oldMessage.author.displayAvatarURL())
        .setDescription(`**Message edited in** ${oldMessage.channel} [Go to message](${oldMessage.url})`)
        .addField('Before', oldMessage.content)
        .addField('After', newMessage.content)
        .setColor(3756250)
      channel.send(embed).catch(e => console.error(e))
    } catch (e) {
      console.error(e)
    }
  }
})

client.on('messageDeleteBulk', async (messages) => {
  let serversettings
  messages.findKey(m => { serversettings = require(`./serversettings/${m.guild.id}.json`) })
  let contents = `BULK DELETE - ${Date()}`
  messages.each(m => { contents += `\n\n[${m.author.id}](${m.author.tag}) ${m.createdAt}: ${m.content}` })
  let originatingChannel
  messages.findKey(m => { originatingChannel = m.channel })
  if (serversettings.ignoredChannels.includes(originatingChannel.id) || serversettings.ignoredCategories.includes(originatingChannel.parentID)) return
  const fileName = `./bulk-${crypto.randomBytes(16).toString('hex')}.txt`
  try {
    fs.writeFileSync(fileName, contents)
  } catch (e) {
    return console.error(e)
  }
  if ((!serversettings.deleteLogChannel) || (serversettings.ignoredCategories.includes(messages.findKey(m => { return m.channel.parentID }))) || (serversettings.ignoredChannels.includes(messages.findKey(m => { return m.channel.id })))) return
  let channel
  messages.findKey(m => { channel = m.guild.channels.resolve(serversettings.deleteLogChannel) })
  const file = new Discord.MessageAttachment(fileName)
  const embed = new Discord.MessageEmbed()
    .setAuthor('Bulk Delete')
    .setTitle('Virgil Message Logging')
    .setDescription(`Bulk delete for ${originatingChannel}`)
    .attachFiles(file)
  await channel.send(embed)
  fs.unlink(fileName, err => { if (err) return console.error(err) })
})

client.on('invalidated', () => {
  console.log('SESSION WAS INVALIDATED!')
  process.exit()
})

client.on('error', e => {
  console.error(e)
})

client.on('shardError', error => {
  console.error(error)
})

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error))
db.connect().catch(e => {
  console.error(e)
  process.exit()
})
client.login(config.token)
async function fetchowner () {
  const app = await client.fetchApplication()
  return app.owner.id
}
module.exports.owner = fetchowner()
