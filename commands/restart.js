module.exports = {
    name: 'r',
    description: 'Restarts the bot',
    adminOnly: true,
    execute(message, args) {
        let embed = new Discord.MessageEmbed()
            .setTitle(getCurrentTime())
            .setDescription('Restarting...')
            .setColor('YELLOW');

        client.channels.cache.get(STATUSID).send(embed)
            .then(() => client.destroy())
            .then(() => client.login(token))

        let embed2 = new Discord.MessageEmbed()
            .setTitle(getCurrentTime())
            .setDescription('The bot has been reset')
            .setColor('GREEN');

        client.channels.cache.get(STATUSID).send(embed2);
    }
}