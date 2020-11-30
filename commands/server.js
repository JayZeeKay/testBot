module.exports = {
    name: 'server',
    description: 'Returns the server name and number of members',
    execute(message, args) {
        message.channel.send('Server name: ' + message.guild.name + '\nTotal members: ' + message.guild.memberCount);
    }
}