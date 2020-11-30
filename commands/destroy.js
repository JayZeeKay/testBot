const Discord = require('discord.js');
const { STATUSID } = require('../constant.json');
module.exports = {
    name: 'destroy',
    description: 'Destroys the bot',
    aliases: ['de'],
    adminOnly: true,
    execute(message, args) {

        let embed = new Discord.MessageEmbed()
            .setTitle(getCurrentTime())
            .setDescription('Shutting down...')
            .setColor('RED');

            client.channels.cache.get(STATUSID).send(embed).then(m => {
            client.destroy();
            console.log("You may close this window");
        });
    }
}