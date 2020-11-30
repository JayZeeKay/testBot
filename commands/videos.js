const Discord = require('discord.js');
module.exports = {
    name: 'videos',
    description: 'Returns @jayzeekay\'s Video Projects Trello Board ',
    execute(message, args) {
        let embed = new Discord.MessageEmbed()
            .setTitle('@jayzeekay\'s video projects')
            .setURL('https://trello.com/b/HbxiqrTU/video-projects')
            .setDescription('Project board for upcoming videos')
            .setThumbnail('https://cdn.discordapp.com/attachments/556282701779304478/776701202766364672/Screenshot_1626.png');

        message.channel.send(embed);
    }
}