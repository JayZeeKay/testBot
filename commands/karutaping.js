module.exports = {
    name: 'kd',
    aliases: ['kdrop', 'k!drop'],
    description: 'Notifies the author after 30 minutes to drop again',
    execute(message, args) {
        message.channel.send("Your id: " + message.author.id);
    }
}