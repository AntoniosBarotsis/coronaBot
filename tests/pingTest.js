// const Discord = require('discord.js');
const ping = require('../commands/ping');
const send = jest.fn((message, text) => message.channel.send(text));
const util = require('./file.util');
const Discord = util.MockDiscord;

const mockFn = jest.fn();
const a = new mockFn();
const b = new mockFn();

util.getCommand('ping').then(e => console.log(e));
// ping.execute(null, null).then(e => console.log(e));

describe('ping.js', () => {
    test('Ping should print pong when executed', () => {
        expect('temp')
    });
});
