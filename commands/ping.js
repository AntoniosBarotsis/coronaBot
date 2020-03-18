module.exports = {
    name: 'ping',
    description: 'Bot replies with "pong"',
    usage: "``.ping``",
    execute(message, args, client) {

        message.channel.send('Pong');

    },
};