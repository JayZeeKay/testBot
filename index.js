const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const { YOUTUBE_API, OWNERID, STATUSID, COMMANDID, COMMANDALTID, QUOTEID, KARUTAID } = require('./constant.json');
const ytdl = require('ytdl-core');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

var search = require('youtube-search');

var opts = {
    maxResults: 5,
    key: YOUTUBE_API,
    type: 'video'
};

let lastCmdSentTime = {};
let waitTimeForUser =  60000 * 30; //Users can only run a command once every 30 minutes
let botLastSent = false;
let timeBetweenEachCmd = 0; //Bot will only respond once a minute.


// keeps the bot awake
require("http").createServer(async (req,res) => { res.statusCode = 200; res.write("ok"); res.end(); }).listen(3000, () => console.log("Now listening on port 3000"));

client.on('message', message => {

    // Moderates the Karuta bot messages; deletes it when user does a Karuta command not in #commands
    if (message.author.bot) {
        if (message.author.id === KARUTAID && message.channel.id !== COMMANDID) {
            message.delete( {timeout: 1} );
        }
        return;
    }

    if (message.channel.type === 'dm') {
        //console.log(message.author.username + ": " + message.content);
        //console.log(message.attachments.proxyURL);
        client.users.cache.get(OWNERID).send(message.author.username + ": " + message.content);
        try {
            if (message.attachments.first().proxyURL !== null) {
                setTimeout(() => {
                    client.users.cache.get(OWNERID).send(message.attachments.first().proxyURL);
                }, 100);
            }
        } catch (err) {
            console.log("No attachment");
        }
        return;
    }

    let isBotOwner = message.author.id === OWNERID;

    if (!message.content.startsWith(prefix)) {
        if (message.content.toLowerCase() === 'kd' || message.content.toLowerCase() === 'k!d' || message.content.toLowerCase() === 'kdrop' || message.content.toLowerCase() === 'k!drop') {
            
            if (message.channel.id !== COMMANDID) return;

            if (botLastSent) {
                if (message.createdTimestamp - botLastSent < timeBetweenEachCmd) {
                    // console.log("timeBetweenEachCmd: " + timeBetweenEachCmd);
                    // console.log("botLastSent: " + botLastSent);
                    return;
                }
            } 

            let userLastSent = lastCmdSentTime[message.author.id] || false;

            if (userLastSent) {
                if (message.createdTimestamp - userLastSent < waitTimeForUser) {
                    // console.log("timeBetweenEachCmd: " + waitTimeForUser);
                    // console.log("userLastSent: " + userLastSent);
                    // console.log("message.createdTimestamp - userLastSent: " + (message.createdTimestamp - userLastSent));
                    const reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'thonk');
                    message.react(reactionEmoji)
                        .then(console.log)
                        .catch(console.error);
                    message.channel.send("You have an ongoing timer!\nThe timer says you will be pinged in `" + (Math.round(((waitTimeForUser - (message.createdTimestamp - userLastSent)) / 60000) * 100) / 100) + " minutes` <@" + message.author.id + ">");
                    return;
                }
            }

            lastCmdSentTime[message.author.id] = message.createdTimestamp;
            botLastSent = message.createdTimestamp;

            const taggedUser = message.author.id;
        
            message.channel.send("You will be pinged in `30 minutes` <@" + taggedUser + ">");

            setTimeout(() => {
                message.channel.send("You can drop again <@" + taggedUser + ">");
            }, 1800000);
            return;
        } else {
            return;
        }
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!(message.channel.id === COMMANDID || message.channel.id === COMMANDALTID)) {
        if (!isBotOwner) {
            return message.reply('that command can only be used in <#' + COMMANDID + '> or <#' + COMMANDALTID + '>');
        }
    }

    const voiceChannel = client.channels.cache.get(VOICECHANNELID);

    if (commandName === 'bruh') {
        if (!isBotOwner) return;
        const user = client.users.cache.get(args[0]);
        var content = "";
        for (var i = 1; i < args.length; i++) {
            content += args[i];
            if (i + 1 < args.length) {
                content += " ";
            }
        }
        return user.send(content);
    } else if (commandName === 'msg') {
        if (!isBotOwner) return;
        var channelName = args[0];
        var message = "";
        for (var i = 1; i < args.length; i++) {
            message += args[i];
            message += " ";
        }
        var toChannel = client.channels.cache.get(channelName);
        return toChannel.send(message);
    } else if (commandName === 'd') {
        if (!isBotOwner) return;
        let embed = new Discord.MessageEmbed()
            .setTitle(getCurrentTime())
            .setDescription('Shutting down...')
            .setColor('RED');

            client.channels.cache.get(STATUSID).send(embed).then(m => {
            client.destroy();
            return console.log("You may close this window");
        });
    } else if (commandName === 'playyt') {
        voiceChannel.join().then(connection => {
            const stream = ytdl(args[0], { filter: 'audioonly' });
            const dispatcher = connection.play(stream);
            
            dispatcher.on('finish', () => voiceChannel.leave());
        });
    } else if (commandName === 'join') {
        voiceChannel.join();
        console.log('Bot joined the vc');
    } else if (commandName === 'leave') {
        voiceChannel.leave();
        console.log('Bot left the vc');
    } else if (commandName === 'testtest') {
        voiceChannel.join().then(connection => {
            const dispatcher = connection.play('F:/osu!/Songs/1276213 Eve - Kaikai Kitan (TV Size)/audio.mp3', { volume: 1, bitrate: 96 });

            dispatcher.on('finish', () => voiceChannel.leave());
        });
    } else if (commandName === 'playmp3') {
        voiceChannel.join().then(connection => {
            const dispatcher = connection.play(message.attachments.first().proxyURL);

            dispatcher.on('finish', () => voiceChannel.leave());
        })
    }

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.adminOnly && !isBotOwner) {
        return message.channel.send("You are not the owner of the bot!");
    }

    if (!cooldowns.has(command.name)){
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more seconds(s) before reusing the \`${command.name}\` command.`);
        }
    }

    try {
	    command.execute(message, args);
    } catch (error) {
	    console.error(error);
	    message.reply('There was an error trying to execute that command!');
    }

});

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.on('ready', () => {

    console.log(getCurrentTime() + 'The bot is ready');

    let embed = new Discord.MessageEmbed()
        .setTitle(getCurrentTime())
        .setDescription('The bot is up and running!')
        .setColor('GREEN');

    client.channels.cache.get(STATUSID).send(embed);

    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'you | DM me, I will respond back :\)',
            type: 'WATCHING',
        }
    });
});

function getCurrentTime(){
    return new Date().toLocaleTimeString() + ": ";
}

function getCurrentDate(){
    let month = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let year = new Date().getFullYear();
    return month + '/' + day + '/' + year;
}

// login to Discord with your app's token
client.login(token);

// this is a test