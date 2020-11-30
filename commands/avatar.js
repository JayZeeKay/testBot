module.exports = {
    name: 'avatar',
    description: 'Returns the profile picture of the author or a tagged user',
    usage: '*<user>*',
    execute(message, args) {
        if (!message.mentions.users.size) {
            message.channel.send(message.author.avatarURL({ format: "png", dynamic: true }));
        } else {

            const taggedUser = message.mentions.users.first();

            message.channel.send(taggedUser.avatarURL({ format: "png", dynamic: true }));

            console.log(taggedUser.avatarURL());

        }
    }
}