const fs = require('fs');
const Discord = require('discord.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const { prefix, token, coinToss, eightball } = require('./config.json');

// keeps the bot awake
require("http").createServer(async (req,res) => { res.statusCode = 200; res.write("ok"); res.end(); }).listen(3000, () => console.log("Now listening on port 3000"));

client.on('message', message => {

    if (!message.content.startsWith(prefix) && !message.content.startsWith("k") || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'help') {

        message.channel.send('The list of commands are: ```args-info```, ```server```, ```cointoss```, ```8ball```, ```kick```, ```myid```, ```avatar```, ```reset```');

    } else if (command === 'args-info') {
        if (!args.length) {
            return message.channel.send('You didn\'t provide any arguments, ${message.author}!');
        } else if (args[0] === 'foo') {
            return message.channel.send('bar');
        }

    message.channel.send('Command name: ' + command + '\nArguments: ' + args);
    } else if (command === 'server') {

        message.channel.send('server name: ' + message.guild.name + '\nTotal members: ' + message.guild.memberCount);

    } else if (command === 'cointoss') {

        var num = Math.random() * 2.01;
        message.channel.send(coinToss[Math.floor(num)].toString());
        console.log(command + ": " + message.author.username + ": " + num);

    } else if (command === '8ball') {

        var num = Math.random() * eightball.length;
        message.channel.send(eightball[Math.floor(num)].toString());
        console.log(command + ": " + message.author.username + ": " + num);

    } else if (command === 'kick') {

        const taggedUser = message.mentions.users.first();

        message.channel.send("You wanted to kick: <@" + taggedUser.id + ">");

    } else if (command === '!d') {

        const taggedUser = message.author.id;
        
        message.channel.send("You will be pinged in 30 minutes <@" + taggedUser + ">");

        setTimeout(() => {
            message.channel.send("You can drop again <@" + taggedUser + ">");
        }, 1800000);

    } else if (command === 'avatar') {
        
        if (!message.mentions.users.size) {
            message.channel.send(message.author.avatarURL({ format: "png", dynamic: true }));
        } else {

            const taggedUser = message.mentions.users.first();

            message.channel.send(taggedUser.avatarURL({ format: "png", dynamic: true }));

            console.log(taggedUser.avatarURL());

        }
    } else if (command === 'reset') {

        if (message.author.id !== '232653096063336448') {
            message.channel.send("You are not the owner of the bot!");
        } else {
            message.channel.send("Resetting...")
            .then(() => client.destroy())
            .then(() => client.login(token))
            .then(() => message.channel.send("The bot has been reset"));
        }

    } else if (command === 'myid') {

        message.channel.send("Your id: " + message.author.id);

    }
});

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
    console.log('The bot is ready');
});

// login to Discord with your app's token
client.login(token);

// this is a test