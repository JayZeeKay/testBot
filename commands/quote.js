const { QUOTEID } = require('../constant.json');
const Discord = require('discord.js');
module.exports = {
    name: 'quote',
    description: 'Creates a embed message in #quotes',
    usage: '<userToQuote> *<userQuotedBy>* <quote>',
    execute(message, args) {
        let taggedUser, taggedUser2, footer;
        let n = 1;
        
        if (!message.mentions.users.size) {
            message.channel.send("You need to tag a user!");
            return;
        } else if (message.mentions.users.size > 0) {
            taggedUser = message.mentions.users.first();
            if (message.mentions.users.size === 2) {
                taggedUser2 = message.mentions.users.last();
                n += 1;
                console.log("Second user mentioned");
                console.log("taggedUser2: " + taggedUser2);
            }
        } 

        var content = "";
        for (var i = n; i < args.length; i++) {
            content += args[i];
            if (i + 1 < args.length) {
                content += " ";
            }
        }

        if (content.length < 1) {
            message.channel.send("You need to quote something!");
            return;
        }

        let quote = '\"' + content + '\"\n-<@' + taggedUser + '>';

        if (taggedUser2 != null) {
            footer = 'Quoted by: ' + taggedUser2.username;
        } else {
            //footer = '\`\`\`\nQuoted by: Anonymous\`\`\`';
            footer = "";
        }

        let embed = new Discord.MessageEmbed()
            .setThumbnail(taggedUser.avatarURL({ format: "png", dynamic: true }))
            .setTitle('and I quote...')
            .setDescription(quote)
            .setFooter(footer);
        
        setTimeout(() => {
            client.channels.cache.get(QUOTEID).send(embed);
        }, 1000);

        message.channel.send("Quote created for " + taggedUser.username);
    }
}