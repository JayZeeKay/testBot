const { coinToss } = require('../constant.json');
module.exports = {
    name: 'cointoss',
    description: 'Returns heads, tails, or rarely on its side',
    execute(message, args) {
        var num = Math.random() * 2.01;
        message.channel.send(coinToss[Math.floor(num)].toString());
        console.log(`${message.author.username} flipped a coin: ${num}`);
    }
}