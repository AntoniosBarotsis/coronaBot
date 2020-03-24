const prefix = process.env.prefix;

module.exports = {
    name: 'ping',
    description: 'Bot replies with "pong"',
    usage: '``' + prefix + 'ping``',
    show: true,
    execute(message, args) {

        message.channel.send('Pong');

    },
};