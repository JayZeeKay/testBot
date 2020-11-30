module.exports = {
    name: 'kick',
    description: 'Command that returns a message that contains the pinged user',
    guildOnly: true,
    args: true,
    usage: '<user>',
    execute(message, args) {
        const taggedUser = message.mentions.users.first();

        message.channel.send("You wanted to kick: <@" + taggedUser.id + ">");
    }
}