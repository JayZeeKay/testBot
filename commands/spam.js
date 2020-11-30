module.exports = {
    name: 'spam',
    description: 'Spams the channel',
    adminOnly: true,
    execute(message, args) {
        if (!isBotOwner) {
            message.channel.send("You are not the owner of the bot!");
        } else {
            for (var i = 0; i < 100; i++) {
                setTimeout(() => {
                    message.channel.send("your mom");
                }, 5000);
            }
        }
    }
}