module.exports = {
    name: 'choose',
    description: 'Test command that returns the command name and args provided',
    args: true,
    usage: `*<option>*, *<option>*`,
    execute(message, args) {
        if (args[1] === undefined) {
            return message.channel.send("You must provide at least 2 options!");
        }

        message.channel.send(`If I had to choose... ${args[Math.floor(Math.random() * args.length)]}`)
    }
}