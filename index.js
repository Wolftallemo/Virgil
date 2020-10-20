const fs = require('fs')
const Discord = require('discord.js')
const config = require('./config.json')
const db = require('./database')
const client = new Discord.Client()
client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

client.once('ready', () => {
	console.log('Virgil has started!')
})

client.on('message', message => {
	if (!message.content.startsWith(config.prefix) || message.author.bot) return
	const args = message.content.slice(config.prefix.length).trim().split(/ +/)
	const command = args.shift().toLowerCase()
	if (!client.commands.has(command)) return message.channel.send('This command don\'t exist yet n00b.')
	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!')
	}	
	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
	console.error(error)
	}
})

client.on('guildMemberAdd', member => {
	const serversettings = require(`./serversettings/${member.guild.id}.json`)
	if (!serversettings.joinLogChannel) return
	const channel = member.guild.channels.cache.find(ch => ch.id == serversettings.joinLogChannel)
	const embed = new Discord.MessageEmbed()
	.setAuthor('Member Joined', member.user.displayAvatarURL())
	.setDescription(`${member} ${member.user.username}#${member.user.discriminator}`)
	.setThumbnail(member.user.displayAvatarURL())
	.setColor(3756250)
	.addField('Registration Date',`${member.user.createdAt}`)
	.setFooter(`ID: ${member.id}`)
	channel.send(embed)
})

client.on('guildMemberRemove', member => {
	const serversettings = require(`./serversettings/${member.guild.id}.json`)
	if (!serversettings.joinLogChannel) return
	const channel = member.guild.channels.cache.find(ch => ch.id == serversettings.joinLogChannel)
	const embed = new Discord.MessageEmbed()
	.setAuthor('Member Left', member.user.displayAvatarURL())
	.setDescription(`${member} ${member.user.username}#${member.user.discriminator}`)
	.setThumbnail(member.user.displayAvatarURL())
	.setColor(3756250)
	.setFooter(`ID: ${member.id}`)
	channel.send(embed)
})

client.on('guildBanAdd', guild => {
	const serversettings = require(`./serversettings/${guild.id}.json`)
	const channel = guild.channels.cache.find(ch => ch.id == serversettings.banLogChannel)
	const embed = new Discord.MessageEmbed()
	.setAuthor('Member Banned', member.user.displayAvatarURL())
	.setDescription(`${member} ${member.username}#${member.discriminator}`)
	.setThumbnail(member.user.displayAvatarURL())
	.setColor(3756250)
	.setFooter(`ID: ${member.id}`)
	channel.send(embed)
})

client.on('messageDelete', message => {
	if (message.channel.type === "dm") return
	if (message.author.bot) return
	const serversettings = require(`./serversettings/${message.guild.id}.json`)
	if ((!serversettings.deleteLogChannel) || (message.author.id == client.user.id) || (serversettings.ignoredChannels.includes(message.channel.id))) return
	const channel = message.guild.channels.cache.find(ch => ch.id == serversettings.deleteLogChannel)
	let messagecontent = `Message ${message.id} deleted from ${message.channel}`
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
})

client.on('messageUpdate', (oldMessage, newMessage) => {
	if ((oldMessage.content) && (newMessage.content) && (newMessage.channel.type !== "dm") && (!newMessage.author.bot)) {
		const serversettings = require(`./serversettings/${newMessage.guild.id}.json`)
		if ((!serversettings.editLogChannel) || (oldMessage.channel.type === "dm") || (serversettings.ignoredChannels.includes(newMessage.channel.id))) return
		const channel = oldMessage.guild.channels.cache.find(ch => ch.id == serversettings.editLogChannel)
		const embed = new Discord.MessageEmbed()
		.setAuthor(`${oldMessage.author.username}#${oldMessage.author.discriminator} (${oldMessage.author.id})`, oldMessage.author.displayAvatarURL())
		.setDescription(`**Message edited in** ${oldMessage.channel} [Go to message](${oldMessage.url})`)
		.addField("Before", oldMessage.content)
		.addField("After", newMessage.content)
		.setColor(3756250)
		channel.send(embed).catch(e => console.error(e))
	}
})

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error))
db.connect().catch(e => console.error(e))


client.login(config.token)