const { eightball } = require('../constant.json');
const Discord = require('discord.js');
module.exports = {
    name: 'roll',
    description: 'Generates a random number between 1 and n',
    usage: '<Rolls a number between 1 and argument. If no argument passed, 1 and 100>',
    execute(message, args) {
        if (args[0] !== undefined && args[0].match(/^[0-9]+$/) != null) {
            var num = Math.floor(Math.random() * args[0]) + 1;
        } else {
            var num = Math.floor(Math.random() * 100) + 1;
        }
        message.channel.send(`${message.author.username} rolled a ${num}`);
    }
}