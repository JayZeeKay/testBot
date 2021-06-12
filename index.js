const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, youtube_api, ocr_api, google_translate_api, ver_no, host } = require('./config.json');
const { OWNERID, STATUSID, QUOTEID, VOICECHANNELID, VOICECHANNELID2, DROPPERROLE, statusList, contentList, typeList, reactList, wishList } = require('./constant.json');
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');
const Canvas = require('canvas');
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
    key: youtube_api,
    type: 'video'
};

let lastCmdSentTime = {};
let waitTimeForUser =  60000 * 30; //Users can only run a command once every 30 minutes
let botLastSent = false;
let timeBetweenEachCmd = 0; 

let lastCmdSentTime2 = {};
let waitTimeForUser2 =  60000 * 10; //Users can only run a command once every 10 minutes
let botLastSent2 = false;
let timeBetweenEachCmd2 = 0; 

let msgChannel = client.channels.cache.get('774858295541891082');
let watchChannel = false;
let watchDelete = true;

let trollUser = null;
let trollEmoji = null;

let floorNumber = 0;
let battleList = [];
let raidList = [];

let muteList = [];

let characterUrl;

// keeps the bot awake
require("http").createServer(async (req,res) => { res.statusCode = 200; res.write("ok"); res.end(); }).listen(3000, () => console.log("Now listening on port 3000"));

client.on('message', async message => {

    for (var i = 0; i < muteList.length; i++) {
        if (muteList[i] == message.author.id) {
            message.delete();
        }
    }

    if (watchChannel) {
        let toggle = true;
        try {
            //if (message.channel.id !== msgChannel.id || message.author.id === client.users.cache.get(user => user.name === 'jayBot').id) return;
            if (message.channel.id !== msgChannel.id) toggle = false;
        } catch (err) {
            
        }
        if (toggle) {
            let wChannel = client.channels.cache.find(channel => channel.name === 'msg-as-bot');
            wChannel.send(`${message.author.displayName}: ${message.content}`);
            try {
                if (message.attachments.first().proxyURL !== null) {
                    setTimeout(() => {
                        wChannel.send(message.attachments.first().proxyURL);
                    }, 100);
                }
            } catch (err) {
                //console.log("No attachment/Error with the attatchment");
            }
        }
        
    }

    // Moderates the Karuta bot messages; deletes it when user does a Karuta command not in #commands
    if (message.author.bot) {
        
        try {
            let embed;
            let image;
            let title;
            let desc;
            try {
                embed = message.embeds[0];
                image = embed.thumbnail.url;
                title = embed.title;
                desc = embed.description;
                console.log(image);
                console.log(title);
                console.log(desc);
            } catch (err) {
                //console.log("something did not work");
            }
            if (message.author.id === client.users.cache.find(user => user.username === 'Karuta').id && message.channel.id !== message.guild.channels.cache.find(channel => channel.name === 'commands').id) {
                message.delete( {timeout: 1} );
                const reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'thonk');
                    message.react(reactionEmoji)
                        .then(console.log)
                        .catch(console.error);
            } else if (message.author.id === client.users.cache.find(user => user.username === 'Karuta').id && message.content.includes("I'm dropping 3 cards since this server is currently active!")) {
                let dropperList, drops;
                let messageLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
                dropperList = message.guild.roles.cache.get(DROPPERROLE).members.map(m=>m.user.id);
                if (message.attachments.first().proxyURL !== null) {
                    drops = message.attachments.first().proxyURL;
                    console.log(drops);
                }
                for (var i = 0; i < dropperList.length; i++) {
                    try {
                        let embed = new Discord.MessageEmbed()
                            .setTitle("Karuta has dropped cards")
                            .setDescription("Go to drop: " + messageLink)
                            .setColor('PURPLE')
                            .setFooter("jayBot v" + ver_no + " | host: " + host)
                            .setImage(drops);
                        client.users.cache.get(dropperList[i]).send(embed);
                    } catch (err) {
                        console.log("Could not send Karuta drop message to " + client.users.cache.find(user => user.id === dropperList[i]).username);
                    }
                }
                let url = `https://api.ocr.space/parse/imageurl?apikey=${ocr_api}&url=${drops}`;
                console.log(url);
                checkDrops(url, messageLink, drops);
            } else if (message.author.id === client.users.cache.find(user => user.username === 'Karuta').id && message.content.includes("is dropping 3 cards!")) {
                let drops = message.attachments.first().proxyURL;
                let url = `https://api.ocr.space/parse/imageurl?apikey=${ocr_api}&url=${drops}`;
                let messageLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
                console.log(url);
                checkDrops(url, messageLink, drops);
            } else if (message.author.id === client.users.cache.find(user => user.username === 'Karuta').id && title.includes("Character Lookup")) {
                characterUrl = image;
                console.log("characterUrL: " + characterUrl);
            } 
        } catch (err) {
            //console.log("Karuta cache not found");
        }
        try {
            let desc;
            let title;
            let author;
            let image;
            try {
                let embed = message.embeds[0];
                desc = embed.description;
                title = embed.title;
                author = embed.author.name;
                image = embed.thumbnail;
                console.log(message.embeds[0].thumbnail);
                //console.log("desc: \n" + desc);
                //console.log(desc.includes("Boss"));
                //console.log(desc.indexOf("Boss") > -1);
                //console.log("title: \n" + title);
            } catch (err) {
                
            }
            try {
                image = message.embeds[0].thumbnail;
                console.log(message.embeds[0].thumbnail);
            } catch (err) {
            }
            if (message.author.id === client.users.cache.find(user => user.username === 'AniGame').id && message.content.includes("Congratulations! You have passed floor")) {
                floorNumber = message.content.match(/\d+/);
                console.log("floorNumber: " + floorNumber);
                console.log("congratulations \n\n\n")
            }
            if (message.author.id === client.users.cache.find(user => user.username === 'AniGame').id && desc.includes("unlocked the next region!")) {
                let locNumber = desc.match(/^[^\d]*(\d+)/);
                let userList = [];
                client.users.cache.each(user => userList.push(user.username));
                console.log("userList: " + userList);
                locNumber++;
                for (var i = 0; i < userList.length; i++) {
                    if (author.includes(userList[i])) {
                        let userId = client.users.cache.find(user => user.username === userList[i]).id;
                        return message.channel.send(`You can go to location ${locNumber} <@${userId}>`);
                    }
                }
            } else if (message.author.id === client.users.cache.find(user => user.username === 'AniGame').id && desc.includes("has defeated enemy")) {
                console.log("floorNumber: " + floorNumber);
                console.log("hi");
                if (floorNumber === 0) {
                    let userList = [];
                    client.users.cache.each(user => userList.push(user.username));
                    console.log("userList: " + userList);
                    for (var i = 0; i < userList.length; i++) {
                        if (author.includes(userList[i])) {
                            let userId = client.users.cache.find(user => user.username === userList[i]).id;
                            return message.channel.send(`You can battle again <@${userId}>`);
                        }
                    }
                } else {
                    let userList = [];
                    client.users.cache.each(user => userList.push(user.username));
                    console.log("userList: " + userList);
                    floorNumber++;
                    for (var i = 0; i < userList.length; i++) {
                        if (author.includes(userList[i])) {
                            let userId = client.users.cache.find(user => user.username === userList[i]).id;
                            message.channel.send(`You can go to floor ${floorNumber} <@${userId}>`);
                            return floorNumber = 0;
                        }
                    }
                }
            } else if (message.author.id === client.users.cache.find(user => user.username === 'AniGame').id && desc.includes("Better luck next time")) {
                let userList = [];
                client.users.cache.each(user => userList.push(user.username));
                console.log("userList: " + userList);
                for (var i = 0; i < userList.length; i++) {
                    if (title.includes(userList[i])) {
                        let userId = client.users.cache.find(user => user.username === userList[i]).id;
                        return message.channel.send(`Try battling the floor again <@${userId}>`);
                    }
                }
            } else if (message.author.id === client.users.cache.find(user => user.username === 'AniGame').id && desc.includes("Total Damage to Raid Boss")) {
                let userList = [];
                client.users.cache.each(user => userList.push(user.username));
                console.log("userList: " + userList);
                for (var i = 0; i < userList.length; i++) {
                    if (desc.includes(userList[i])) {
                        let userId = client.users.cache.find(user => user.username === userList[i]).id;
                        return message.channel.send(`You can raid battle again <@${userId}>`);
                    }
                }
            }
        } catch (err) {
            //console.log("AniGame cache not found");
        }
        return;
    }

    if (message.channel.type === 'dm') {
        //console.log(message.author.username + ": " + message.content);
        //console.log(message.attachments.proxyURL);
        let embed = new Discord.MessageEmbed()
            .setTitle(message.author.username)
            .setDescription(message.content)
            .setColor('PURPLE')
            .setFooter(message.author.id)
            .setImage(message.author.avatarURL({ format: "png", dynamic: true }));
        client.users.cache.get(OWNERID).send(embed);
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

    if (trollUser !== null) {
        if (message.author.id === trollUser) {
            try {
                message.react(trollEmoji);
            } catch (err) {
                console.log(err);
                console.log("There was an error");
            }
        }
    }

    let isBotOwner = message.author.id === OWNERID;

    if (Math.random() > 0.3) {

    for (var i = 0; i < reactList.length; i++) {
        if (message.content.includes(reactList[i][0])) {
            try {
                let reactEmoji = message.guild.emojis.cache.find(emoji => emoji.name === reactList[i][1]);
                message.react(reactEmoji);
            } catch (err) {
                message.react(reactList[i][1]);
            }
        }
    }

    }

    if (!message.content.startsWith(prefix)) {
        if (message.content.toLowerCase() === 'kd' || message.content.toLowerCase() === 'k!d' || message.content.toLowerCase() === 'kdrop' || message.content.toLowerCase() === 'k!drop') {
            
            // if (message.channel.id !== message.guild.channels.cache.find(channel => channel.name === "commands").id) {
            //     console.log("Channel id not matching");
            //     return;
            // }

            // if (botLastSent) {
            //     if (message.createdTimestamp - botLastSent < timeBetweenEachCmd) {
            //         // console.log("timeBetweenEachCmd: " + timeBetweenEachCmd);
            //         // console.log("botLastSent: " + botLastSent);
            //         return;
            //     }
            // } 

            // let userLastSent = lastCmdSentTime[message.author.id] || false;

            // if (userLastSent) {
            //     if (message.createdTimestamp - userLastSent < waitTimeForUser) {
            //         // console.log("timeBetweenEachCmd: " + waitTimeForUser);
            //         // console.log("userLastSent: " + userLastSent);
            //         // console.log("message.createdTimestamp - userLastSent: " + (message.createdTimestamp - userLastSent));
            //         const reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'thonk');
            //         message.react(reactionEmoji)
            //             .then(console.log)
            //             .catch(console.error);
            //         message.channel.send("You have an ongoing timer!\nThe drop timer says you will be pinged in `" + (Math.round(((waitTimeForUser - (message.createdTimestamp - userLastSent)) / 60000) * 100) / 100) + " minutes` <@" + message.author.id + ">");
            //         return;
            //     }
            // }

            // lastCmdSentTime[message.author.id] = message.createdTimestamp;
            // botLastSent = message.createdTimestamp;

            // const taggedUser = message.author.id;
            
            // let currentTime = new Date().getTime();
            // let userLastSent2 = lastCmdSentTime2[message.author.id] || false;

            // if (currentTime - userLastSent2 < waitTimeForUser2) {
            //     message.channel.send("Note: **Your grab is still on cooldown!** If you grab, you will use your Extra Grab.\nThe grab timer says you will be pinged in `"  + (Math.round(((waitTimeForUser2 - (currentTime - userLastSent2)) / 60000) * 100) / 100) + " minutes` <@" + message.author.id + ">");
            // }

            // message.channel.send("You can drop again in `30 minutes` <@" + taggedUser + ">");

            // setTimeout(() => {
            //     message.channel.send("You can drop again <@" + taggedUser + ">");
            // }, 1800000);
            return;
        } else if (message.content.toLowerCase().localeCompare(".battle") == 0) {
            try {
                if (!battleList.includes(message.author.id)) {
                    battleList.push(message.author.id);
                } else {
                    let index = battleList.indexOf(message.author.id);
                    battleList.splice(index, 1);
                }
            } catch {
                battleList.push(message.author.id);
            }
            console.log("battleList: " + battleList);
        } else if (message.content.toLowerCase().localeCompare(".rd battle") == 0) {
            try {
                if (!raidList.includes(message.author.id)) {
                    raidList.push(message.author.id);
                } else {
                    let index = raidList.indexOf(message.author.id);
                    raidList.splice(index, 1);
                }
            } catch {
                raidList.push(message.author.id);
            }
            console.log("raidList: " + raidList);
        } else if (message.content.toLowerCase().includes('test123')) {
            let userList = [];
            client.users.cache.each(user => userList.push(user.username));
            console.log("userList: " + userList);
            for (var i = 0; i < userList.length; i++) {
                if (message.content.includes(userList[i])) {
                    let userId = client.users.cache.find(user => user.username === userList[i]).id;
                    return message.channel.send(`You can raid battle again <@${userId}>`);
                }
            }
        } else {
            return;
        }
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!(message.channel.id === message.guild.channels.cache.find(channel => channel.name === "commands").id || message.channel.id === message.guild.channels.cache.find(channel => channel.name === "jay-commands").id)) {
        if (!isBotOwner) {
            return message.reply('that command can only be used in <#' + message.guild.channels.cache.find(channel => channel.name === "commands").id + '> or <#' + message.guild.channels.cache.find(channel => channel.name === "jay-commands").id + '>');
        }
    }

    const voiceChannel = client.channels.cache.get(VOICECHANNELID);

    if (commandName === 'dm') {
        if (!isBotOwner) return;
        const user = client.users.cache.get(args[0]);
        var content = "";
        for (var i = 1; i < args.length; i++) {
            content += args[i];
            if (i + 1 < args.length) {
                content += " ";
            }
        }
        try {
            user.send(content);
        } catch (err) {
            console.log("Error trying to send a message");
            console.log(err);
        }
        return;
    } else if (commandName === 'cache') {
        if (!isBotOwner) return;
        if (args[0] === 'users') {
            console.log("User cache:\n");
            console.log(client.users.cache.array());
        } else if (args[0] === 'channels') {
            console.log("Channel cache:\n");
            try {
                console.log(client.channels.cache.findKey(channel => channel.name === args[1]));
            } catch (err) {
                console.log(err);
            }
        } else if (args[0] === 'karuta') {
            console.log("Karuta ID cache:\n");
            try {
                console.log(client.users.cache.find(user => user.username === 'Karuta').id);
            } catch (err) {
                console.log(err);
            }
        } else {
            console.log("Arg needed");
        }
        return;
    } else if (commandName === 'msg') {
        if (!isBotOwner) return;
        let channel;
        try {
            channel = message.guild.channels.cache.find(channel => channel.name === args[0]);
        } catch (err) {
            return message.channel.send("You did not provide a valid channel name");
        }
        msgChannel = channel;
        console.log("channel: " + channel.id);
        console.log("msgChannel: " + msgChannel.id);
        var message = "";
        for (var i = 1; i < args.length; i++) {
            message += args[i];
            message += " ";
        }
        return channel.send(message);
    } else if (commandName === 'kill') {
        if (!isBotOwner) return;
        let embed = new Discord.MessageEmbed()
            .setTitle(getCurrentTime())
            .setDescription('Shutting down...')
            .setColor('RED')
            .setFooter("jayBot v" + ver_no + " | host: " + host);

            let vcLog = client.channels.cache.find(channel => channel.name === "vc-log");
            //vcLog.send(" ");
            vcLog.send(`\nVC status tracking is \`off\`\n`);
            //vcLog.send(" ");
            client.channels.cache.get(STATUSID).send(embed).then(m => {
            client.destroy();
            return console.log("You may close this window");
        });
    } else if (commandName === 'playyt') {
        if (message.member.voice.channel) {
            message.member.voice.channel.join().then(connection => {
                const stream = ytdl(args[0], { filter: 'audioonly' });
                const dispatcher = connection.play(stream);
                
                dispatcher.on('finish', () => voiceChannel.leave());
            });
        }
    } else if (commandName === 'join') {
        if (message.member.voice.channel) {
            message.member.voice.channel.join();
        }
        console.log('Bot joined the vc');
    } else if (commandName === 'leave') {
        if (message.member.voice.channel) {
            message.member.voice.channel.leave();
        }
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
    } else if (commandName === 'clear') {
        if (!isBotOwner) return;
        message.channel.bulkDelete(args[0]);
    } else if (commandName === 'botstatus') {
        if (!isBotOwner) return;
        // let newStatus = statusList[args[0]];
        // let newType = typeList[args[1]];
        let newContent = "";
        for (var i = 2; i < args.lengt  h; i++) {
            newContent += args[i];
            if (i + 1 < args.length) {
                newContent += " ";
            }
        }
        client.user.setPresence({
            status: args[0],
            activity: {
                name: newContent,
                type: args[1].toUpperCase(),
            }
        });
    } else if (commandName === 'wc') {
        if (!isBotOwner) return;
        watchChannel = !watchChannel;
        console.log("watchChannel: " + watchChannel);
        console.log("msgChannel: " + msgChannel);
    } else if (commandName === 'wd') {
        if (!isBotOwner) return;
        watchDelete = !watchDelete;
        console.log("watchDelet: " + watchDelete);
    } else if (commandName === 'troll') {
        if (args[0] === undefined) {
            trollUser = null;
            trollEmoji = null;
        } else {
            try {
                trollUser = args[0];
                trollEmoji = args[1];
            } catch (err) {
                console.log(err);
                console.log("An error occured");
            }
        }
    } else if (commandName === 'cooldown' || commandName === 'cd') {
        let dropKeys = Object.keys(lastCmdSentTime);
        let dropText = "";
        console.log("dropKeys: " + dropKeys);
        dropKeys.forEach((key, index) => {
            dropText += `${client.users.cache.find(user => user.id === key).username}: ${(Math.round((((60000 * 30) - (message.createdTimestamp - lastCmdSentTime[key])) / 60000) * 100) / 100 )} minutes\n`;
        })
        let grabKeys = Object.keys(lastCmdSentTime2);
        let grabText = "";
        console.log("grabKeys: " + grabKeys);
        grabKeys.forEach((key, index) => {
            grabText += `${client.users.cache.find(user => user.id === key).username}: ${(Math.round((((60000 * 10) - (message.createdTimestamp - lastCmdSentTime2[key])) / 60000) * 100) / 100 )} minutes\n`;
        })
        if (dropText == "") dropText = "None";
        if (grabText == "") grabText = "None";
        let embed = new Discord.MessageEmbed()
            .setTitle("Karuta Cooldowns")
            .addFields(
                { name: 'Drops', value: dropText },
                { name: 'Grabs', value: grabText }
            )
            .setColor('PURPLE');
        message.channel.send(embed);
    } else if (commandName === 'list') {
        let battleText = "";
        for (var i = 0; i < battleList.length; i++) {
            battleText += `${i}: ${client.users.cache.find(user => user.id === battleList[i]).username}\n`;
        }
        let raidText = "";
        for (var i = 0; i < raidList.length; i++) {
            raidText += `${i}: ${client.users.cache.find(user => user.id === raidList[i]).username}\n`;
        }
        if (battleText == "") battleText = "None";
        if (raidText == "") raidText = "None";
        let embed = new Discord.MessageEmbed()
            .setTitle("AniGame List")
            .addFields(
                { name: 'Battle', value: battleText },
                { name: 'Raid', value: raidText }
            )
            .setColor('PURPLE')
            .setFooter('To remove yourself from the list, do .battle or .rd battle again');
        message.channel.send(embed);
    } else if (commandName === 'array') {
        console.log(client.users.cache.array());
    } else if (commandName === 'mute') {
        if (!isBotOwner) return;
        if (args[0] === undefined) return;
        let user = client.users.cache.find(user => user.username === args[0]).id;
        for (var i = 0; i < muteList.length; i++) {
            if (muteList[i] === user) {
                muteList.splice(i, 1);
                console.log(muteList);
                return;
            }
        }
        muteList.push(user);
        console.log(muteList);
        return;
    } else if (commandName === 'renamevc') {
        if (args[0] === undefined) return;
        if (!(args[0].match(/^[a-zA-Z0-9_.-]*$/))) return;
        let vc = message.guild.channels.cache.find(channel => channel.id === VOICECHANNELID2);
        console.log(vc);
        try {
            vc.setName(args[0]);  
        } catch (err) {
            return message.author.send("Invalid name");
        }
        message.author.send(`You have changed the vc name to ${args[0]}`)
        return message.delete();
    } else if (commandName === 'fetch') {
        let msg = message;
        let id = args[0];
        message.channel.messages.fetch(id)
            .then(fetch => { msg.channel.send(fetch.content) });
        return;
    } else if (commandName === 'karutaping') {
        let dropperList;
        let messageLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
        // message.guild.roles.fetch('629674679321493525')
        //     .then(role => dropperList = role.members.map(m => m.user.id))
        //     .then(console.log(dropperList));
        //dropperList = message.guild.roles.fetch(629674679321493525).members.map(m=>m.user.id);
        // dropperList = message.guild.roles.fetch('629674679321493525')
        //     .then(console.log(dropperList));
        dropperList = message.guild.roles.cache.get('629674679321493525').members.map(m=>m.user.id);
        for (var i = 0; i < dropperList.length; i++) {
            try {
                client.users.cache.get(dropperList[i]).send("Karuta has dropped cards\n" + messageLink);
            } catch (err) {
                console.log("Could not send Karuta drop message to " + client.users.cache.find(user => user.id === dropperList[i]).username);
            }
        }
    } else if (commandName === 'ocr') {
        let url = `https://api.ocr.space/parse/imageurl?apikey=${ocr_api}&url=${message.attachments.first().proxyURL}`;
        console.log(url);
        //let msg = await message.channel.send("Loading parsed text...");
        //let json = await fetch(url)
            //.then(response => response.json());
            //.then(json => msg.edit("test test test"));
            //console.log(json.ParsedResults.ParsedText);
            //await msg.edit(json.ParsedResults.ParsedText);
            //.then(text => JSON.parse(text))
            //.then(json => message.channel.send(json.ParsedResults.ParsedText));
            //.then(file => JSON.parse(file))
            //.then(json => message.channel.send(json));
        // fetch(url)
        //     .then(response => response.text())
        //     .then(text => JSON.parse(text))
        //     .then((json) => {
        //         console.log(json)
        //     });
        fetch(url)
            .then(response => response.json())
            .then((json) => {
                //console.log(json.ParsedResults[0].ParsedText);
                text = json.ParsedResults[0].ParsedText;
                message.channel.send(text);
                // for (player in wishList) {
                //     //console.log("player: " + player);
                //     for (word in wishList[player]) {
                //         //console.log("word: " + word);
                //         //console.log("wordArray: " + wishList[player][word]);
                //         //console.log("player.toString(): " + player.toString());
                //         if (text.includes(wishList[player][word])) {
                //             let dm = client.users.cache.find(user => user.username === player.toString());
                //             let embed = new Discord.MessageEmbed()
                //                 .setTitle("Karuta has dropped cards")
                //                 .setDescription("Go to drop: " + messageLink)
                //                 .setColor('PURPLE')
                //                 .setFooter("jayBot v" + ver_no + " | host: " + host)
                //                 .setImage(drops);
                //             try {
                //                 dm.send("Detected: " + word);
                //             } catch (err) {
                //                  console.log("Could not send wishList message");
                //             }
                //         }
                //     }
                // }
            });
        //const obj = JSON.parse(file);
        //console.log(file);
        //message.channel.send(file);
    } else if (commandName === 'ocrjpn') {
        let url = `https://api.ocr.space/parse/imageurl?apikey=${ocr_api}&url=${message.attachments.first().proxyURL}&language=jpn`;
        console.log(url);
        fetch(url)
            .then(response => response.json())
            .then((json) => {
                //console.log(json.ParsedResults[0].ParsedText);
                text = json.ParsedResults[0].ParsedText;
                message.channel.send(text);
            });
    } else if (commandName === 'imagegenerate') {
        const canvas = Canvas.createCanvas(200, 800);

        const ctx = canvas.getContext('2d');

        const avatar = await Canvas.loadImage(message.author.displayAvatarURL( { format: 'png' }));

        ctx.drawImage(avatar, 25, 25, canvas.width, canvas.height);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'test-image.png');

        message.channel.send('Long', attachment);
    } else if (commandName === 'testframe') {

        //const frameUrl = args[0];

        const charUrl = args[0];
        const frameUrl = args[1];

        const canvas = Canvas.createCanvas(274, 400);
        const ctx = canvas.getContext('2d');

        //const image = await Canvas.loadImage(characterUrl);
        const image = await Canvas.loadImage(charUrl);
        ctx.drawImage(image, 30, 55, canvas.width - 60, canvas.height - 85);

        //const frame = await Canvas.loadImage('./brass2.png');
        const frame = await Canvas.loadImage(frameUrl);
        ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'image.png');

        message.channel.send(attachment);
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

// client.on('message', () => {
//     //if (Math.random() < 0.98) return;
//     let newStatus = statusList[Math.floor(Math.random() * statusList.length)];
//     let newContent = contentList[Math.floor(Math.random() * contentList.length)];
//     let newType = typeList[Math.floor(Math.random() * typeList.length)];

//     client.user.setPresence({
//         status: newStatus,
//         activity: {
//             name: newContent,
//             type: newType,
//         }
//     });
// })

client.on('voiceStateUpdate', (oldState, newState) => {
    let vcLog = client.channels.cache.find(channel => channel.name === "vc-log");
    let status = " ";
    // console.log(newState.channelID);
    // console.log(client.channels.cache.find(channel => channel.name === "high-iq-discussion"));
    if (oldState.channelID === newState.channelID) {
        if (oldState.serverDeaf !== newState.serverDeaf) {
            if (newState.serverDeaf) {
                status = 'server deafened';
            } else {
                status = 'server undeafened';
            }
        } else if (oldState.serverMute !== newState.serverMute) {
            if (newState.serverMute) {
                status = 'server muted';
            } else {
                status = 'server unmuted';
            }
        } else if (oldState.selfDeaf !== newState.selfDeaf) {
            if (newState.selfDeaf) {
                status = 'deafened';
            } else {
                status = 'undeafened';
            }
        } else if (oldState.selfMute !== newState.selfMute) {
            if (newState.selfMute) {
                status = 'muted';
            } else {
                status = 'unmuted';
            }
        } else if (oldState.selfVideo !== newState.selfVideo) {
            if (newState.selfVideo) {
                status = 'turned on their camera';
            } else {
                status = 'turned off their camera';
            }
        } 
        if (status !== " ") {
            return vcLog.send(`\`${newState.member.displayName} (${newState.member.user.username})\` has \`${status}\` in \`#${newState.channel.name}\` at \`${new Date().toLocaleTimeString()}\``);
        } else {
            return;
        }
    } 
    try {
        if (newState.channel) {
            status = `joined\` \`#${newState.channel.name}`;
        } else {
            try {
                status = `left\` \`#${oldState.channel.name}`;
            } catch (err) {
                console.log("Error trying to log vc status");
            } 
        }
    } catch (err)  {
        try {
            status = `left\` \`#${oldState.channel.name}`;
        } catch (err) {
            console.log("Error trying to log vc status");
        }
    }
    vcLog.send(`\`${newState.member.displayName} (${newState.member.user.username})\` has \`${status}\` at \`${new Date().toLocaleTimeString()}\``);
});

// this does not get emitted if the message deleted is the author of the message
client.on('messageDelete', async (messageDelete) => {
    if (!watchDelete || messageDelete.author.bot) return;
    let mdLog = client.channels.cache.find(channel => channel.name === 'del_msg-log');
    let author = messageDelete.author;
    let username = author.username;
    let displayName = messageDelete.member.displayName;
    // try {
    //     displayName = await messageDelete.guild.members.fetch(author.id).displayName.then(m => {
    //         mdLog.send(`\`${displayName} (${username})\` deleted a message in \`#${messageDelete.channel.name}\` at \`${new Date().toLocaleTimeString()}\``);
    //     });
    // } catch (err) {
    //     mdLog.send(`\`${displayName} (${username})\` deleted a message in \`#${messageDelete.channel.name}\` at \`${new Date().toLocaleTimeString()}\``);
    //     console.log("Could not get displayName");
    // }
    // console.log(author);
    // console.log(displayName);
    mdLog.send(`\`${displayName} (${username})\` deleted a message in \`#${messageDelete.channel.name}\` at \`${new Date().toLocaleTimeString()}\``);
    //mdLog.send("Somebody deleted a message");
});

client.on('messageReactionAdd', (messageReaction, user) => {
    // console.log(messageReaction.emoji.name);
    // console.log(messageReaction.message.author.username);
    // console.log(user);
    let currentTime = new Date().getTime();
    // console.log(currentTime);
    if (user === client.users.cache.find(user => user.username === 'Karuta')) return;
    try {
        if (messageReaction.message.author.username === client.users.cache.find(user => user.username === 'Karuta').username) {
            // if (messageReaction.emoji.name === '1️⃣' || messageReaction.emoji.name === '2️⃣' || messageReaction.emoji.name === '3️⃣') {

            
            //     if (botLastSent2) {
            //         if (currentTime - botLastSent2 < timeBetweenEachCmd2) {
            //             return;
            //         }
            //     } 
            //     let userLastSent2 = lastCmdSentTime2[user.id] || false;

            //     // console.log(userLastSent2);
            //     // console.log(messageReaction.message.createdTimestamp);
            //     // console.log(userLastSent2);
            //     // console.log(messageReaction.message.createdTimestamp - waitTimeForUser2);
            //     // console.log(waitTimeForUser2);

            //     if (userLastSent2) {
            //         if (currentTime - userLastSent2 < waitTimeForUser2) {
            //             messageReaction.message.channel.send("You have an ongoing timer!\nThe grab timer says you will be pinged in `" + (Math.round(((waitTimeForUser2 - (currentTime - userLastSent2)) / 60000) * 100) / 100) + " minutes` <@" + user.id + ">");
            //             return;
            //         }
            //     }

            //     lastCmdSentTime2[user.id] = currentTime;
            //     botLastSent2 = currentTime;

            //     messageReaction.message.channel.send("You can grab again in `10 minutes` <@" + user.id + ">");

            //     setTimeout(() => {
            //         messageReaction.message.channel.send("You can grab again <@" + user.id + ">");
            //     }, 600000);
            // }
        }
    } catch (err) {
        //console.log("Bot cache not found");
    }
    return;
})

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.on('ready', () => {

    console.log(getCurrentTime() + 'The bot is ready');

    let embed = new Discord.MessageEmbed()
        .setTitle(getCurrentTime())
        .setDescription('The bot is up and running!')
        .setColor('GREEN')
        .setFooter("jayBot v" + ver_no + " | host: " + host);

    client.channels.cache.find(channel => channel.name === "jaybot-status").send(embed);

    let vcLog = client.channels.cache.find(channel => channel.name === "vc-log");
    //(" ");
    vcLog.send(`\nVC status tracking is \`on\`\n`);
    //vcLog.send(" ");

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

/*
      message {Discord.Message}: the message you want to search in
      target {string}: the string you're looking for
      {
        caseSensitive {boolean}: whether you want the search to be case case-sensitive
        author {boolean}: whether you want to search in the author's name
        description {boolean}: whether you want to search in the description
        footer {boolean}: whether you want to search in the footer
        title {boolean}: whether you want to search in the title
        fields {boolean}: whether you want to search in the fields
      }
     */
    function findInMessage(message, target, {
        caseSensitive = false,
        author = false,
        description = true,
        footer = false,
        title = false,
        fields = false
      }) {
        if (!target || !message) return null;
        let str = caseSensitive ? target : target.toLowerCase();
      
        if ((caseSensitive && message.content.includes(str)) ||
          (!caseSensitive && message.content.toLowerCase().includes(str))) return true;
      
        for (let embed of message.embeds) {
          if ((caseSensitive && (
              (author && embed.author.includes(str)) ||
              (description && embed.description.includes(str)) ||
              (footer && embed.footer.includes(str)) ||
              (title && embed.title.includes(str)))) ||
            (!caseSensitive && (
              (author && embed.author.toLowerCase().includes(str)) ||
              (description && embed.description.toLowerCase().includes(str)) ||
              (footer && embed.footer.toLowerCase().includes(str)) ||
              (title && embed.title.toLowerCase().includes(str))))
          ) return true;
      
          if (fields)
            for (let field of embed.fields) {
              if ((caseSensitive && [field.name, field.value].includes(str)) ||
                (!caseSensitive && [field.name.toLowerCase(), field.value.toLowerCase()].includes(str))) return true;
            }
        }
      
        return false;
      }

function checkDrops(fetchUrl, messageLink, dropImage) {
    fetch(fetchUrl)
        .then(response => response.json())
        .then((json) => {
            //console.log(json.ParsedResults[0].ParsedText);
            let text = json.ParsedResults[0].ParsedText.toLowerCase();
            console.log(text);
            for (player in wishList) {
                //console.log("player: " + player);
                for (word in wishList[player]) {
                    //console.log("word: " + word);
                    //console.log("wordArray: " + wishList[player][word]);
                    //console.log("player.toString(): " + player.toString());
                    if (text.includes(wishList[player][word])) {
                        let dm = client.users.cache.find(user => user.username === player.toString());
                        let embed = new Discord.MessageEmbed()
                            .setTitle(`${wishList[player][word]} detected in Karuta drop! `)
                            .setDescription("Go to drop: " + messageLink)
                            .setColor('PURPLE')
                            .setFooter("jayBot v" + ver_no + " | host: " + host)
                            .setImage(dropImage);
                        try {
                            dm.send(embed);
                        } catch (err) {
                            console.log("Could not send wishList message");
                        }
                    }
                }
            }
        });
}
// login to Discord with your app's token
client.login(token);

// this is a test