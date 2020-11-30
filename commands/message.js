const index = require('../index.js');
module.exports = {
    name: 'message',
    description: 'Lets the admin send a message to a channel through the bot',
    adminOnly: true,
    execute(message, args) {
        c = index.client;
        var channelName = args[0];
        var message = "";
        for (var i = 1; i < args.length; i++) {
            message += args[i];
            message += " ";
        }
        var toChannel = c.channels.cache.get(channelName);
        toChannel.send(message);
    }
}