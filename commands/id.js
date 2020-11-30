module.exports = {
    name: 'id',
    description: 'Returns the id of the author',
    execute(message, args) {
        message.channel.send("Your id: " + message.author.id);
    }
}