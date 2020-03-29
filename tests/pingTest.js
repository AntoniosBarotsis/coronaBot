const util = require('./file.util');

describe('ping.js', () => {
    const message = {
        channel: {
            send: jest.fn()
        }
    };
    it('ping works', async () => {
        await util.getCommand('ping').then(e => {
            e.execute(message);
            // expect(e.execute(message)).toHaveBeenCalled();
            expect(message.channel.send).toHaveBeenLastCalledWith('Pong')
        });
    })
});
