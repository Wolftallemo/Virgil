module.exports = {
  async getuser (member, message) {
    let validmember = true
    let retrievedmember
    if (member.match(/(^<@!?[0-9]{16,18}>)/)) retrievedmember = await message.mentions.members.first()
    else if (member.match(/[A-z]/)) await message.guild.members.fetch({ query: member, limit: 1 }).then(result => result.mapValues(values => { retrievedmember = values }))
    else retrievedmember = await message.guild.members.fetch(member).catch(e => { if (e.httpStatus === 400) validmember = false })
    if (!validmember) await message.guild.members.fetch({ query: member, limit: 1 }).then(results => { results.mapValues(values => { retrievedmember = values }) })
    return await retrievedmember
  }
}
