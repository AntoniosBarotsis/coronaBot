const fs = require('fs');

module.exports = {
    name: 'log',
    description: 'Logs your message which will later be viewed by me 0_0 so ples post many epic feedback ok thanks bye. Do ``.help log``',
    usage: 'What I want feedback on: So .cv should be working now. If you find countries that should work but dont ' +
        '(for example usa or vatican didnt work) make sure to .log them so I can fix them later.',
    show: false,
    execute(message, args) {
        fs.readFile('data/log.json', (err, json) => {
            if (err) { console.error(err); json = '{}'; }

            const currentData = JSON.parse(json);

            const recordedUsers = [];
            for (const i in currentData) { recordedUsers.push(i); }

            if (recordedUsers.includes(message.member.user.tag)) {
                // user exists
                for (const i in currentData) {
                    if (i === message.member.user.tag) {
                        currentData[i].messages.push(message.content.replace('.log ', ''));
                    }
                }
            } else {
                // new user
                currentData[message.member.user.tag] = {
                    messages: [message.content.replace('.log ', '')],
                };
            }

            message.channel.send('Message logged thanks :)');

            fs.writeFile('data/log.json', JSON.stringify(currentData), (err) => {
                console.error(err);
            });
        });
    },
};
