module.exports = {
    name: 'channel',
    description: 'Returns the channel id of the channel the message was sent in',
    execute(message, args) {
        message.channel.send(message.channel.id);
    }
}