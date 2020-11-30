const { eightball } = require('../constant.json');
const Discord = require('discord.js');
module.exports = {
    name: '8ball',
    description: 'Generates a random message like an 8 ball toy',
    args: true,
    usage: '<ask it a question>',
    execute(message, args) {
        var num = Math.random() * eightball.length;
        console.log(`${message.author.username} rolled: ${num}`);
        num = Math.floor(num);
        let result = eightball[num];
        let embed = new Discord.MessageEmbed()
            .setTitle('jay\'s 8 ball machine')
            .setDescription('The :8ball: tells: ' + result)
            .setColor('PURPLE');
        message.channel.send(embed);
    }
}