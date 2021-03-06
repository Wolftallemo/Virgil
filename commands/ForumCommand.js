module.exports = {
  name: 'forum',
  properName: 'Forum',
  description: 'Looks up a user on the set discourse forum by discord id',
  guildOnly: true,
  async execute (message, args) {
    const { forumApiKey, forumApiUser, forumBaseUrl } = require('../config.json')
    if (!forumApiKey || !forumApiUser || !forumBaseUrl) return await message.channel.send('This command is disabled as the bot owner did not set any credentials.')
    const request = require('axios')
    const { getuser } = require('../getuser')
    const member = await getuser(args.slice(0).join(' '), message)
    if (!member) return await message.channel.send('I could not find this user.')
    const forumData = await request(`${forumBaseUrl}/u/by-external/discord/${member.id}.json`, {
      headers: {
        'Api-Key': forumApiKey,
        'Api-Username': forumApiUser
      },
      validateStatus: false
    })
    if (forumData.status === 404) return await message.channel.send('This user does not have a linked forum account.')
    if (forumData.status !== 200) return await message.channel.send('An error occured when looking up information on that account!')
    const { MessageEmbed } = require('discord.js')
    const embed = new MessageEmbed()
      .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
      .setColor(3756250)
      .setTitle(forumData.data.user.username)
      .setURL(`${forumBaseUrl}/u/${forumData.data.user.username}`)
      .setThumbnail(`${forumBaseUrl}${forumData.data.user.avatar_template.replace('{size}', '360')}`)
      .addFields(
        { name: 'Is Admin', value: forumData.data.user.admin },
        { name: 'Is Moderator', value: forumData.data.user.moderator },
        { name: 'Last Posted At', value: new Intl.DateTimeFormat(message.guild.preferredLocale, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date(forumData.data.user.last_seen_at)) },
        { name: 'Last Seen', value: new Intl.DateTimeFormat(message.guild.preferredLocale, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date(forumData.data.user.last_seen_at)) },
        { name: 'Signup Date', value: new Intl.DateTimeFormat(message.guild.preferredLocale, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date(forumData.data.user.created_at)) }
      )
    if (forumData.data.user.name) embed.addField('Display Name', forumData.data.user.name)
    if (forumData.data.user.featured_topic) embed.addField('Featured Topic', `[${forumData.data.user.featured_topic.title}](${forumBaseUrl}/t/${forumData.data.user.featured_topic.slug}/${forumData.data.user.featured_topic.id})`)
    await message.channel.send(embed)
  }
}
