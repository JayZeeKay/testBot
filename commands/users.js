module.exports = {
    name: 'users',
    description: 'Returns the users of the server',
    execute(message, args) {
        message.channel.send(message.client.users);
    }
}