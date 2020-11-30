module.exports = {
    name: 'youtube',
    description: 'Returns search results of youtube videos based on arguments',
    execute(message, args) {
        console.log("Youtube command");
        var query = "";
        console.log(args.length);
        for (var i = 0; i < args.length; i++) {
            console.log("i: " + i);
            console.log(args[i]);
            query += args[i];
            if (i + 1 <= args.length) {
                query += " ";
            }
        }

        console.log(query);

        var result = search(query, opts).catch(err => console.log(err));

        console.log(result);

        var selected = result.results[0];

        const embed = new Discord.MessageEmbed()
            .setTitle(`${selected.title}`)
            .setURL(`${selected.link}`)
            .setDescription(`${selected.description}`)
            .setThumbnail(`${selected.thumbnails.default.url}`);

        message.channel.send(embed);
    }
}