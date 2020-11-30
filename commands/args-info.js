module.exports = {
    name: 'args-info',
    description: 'Test command that returns the command name and args provided',
    args: true,
    execute(message, args) {
        if (args[0] === 'foo') {
            return message.channel.send('bar');
        }

        message.channel.send('Command name: args-info\nArguments: ' + args);
    }
}