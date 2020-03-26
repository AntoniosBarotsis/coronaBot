const prefix = process.env.prefix;
const fs = require('fs');

module.exports = {
    name: 'log',
    description: 'Logs your message which will later be viewed by me 0_0 so ples post many epic feedback ok thanks bye. Do ``.help log``',
    usage: 'Jabaited no usage its just .log lmao so basically just check how .testg looks like and see previous pics. Im trynna figure out what' +
        'the colors should look like so use .log to lmk how the ones ive shown so far look like and if u have any suggestions (remember we want confirmed cases' +
        'deaths and recoveries so mention which one u are referring to thank)',
    show: true,
    execute(message, args) {

        fs.readFile('data/log.json', (err, json) => {
            if (err)
                console.error(err);

            let currentData = JSON.parse(json);

            let recordedUsers = [];
            for (let i in currentData)
                recordedUsers.push(i);

            if (recordedUsers.includes(message.member.user.tag)) {
                // user exists
                for (let i in currentData) {
                    if (i === message.member.user.tag) {
                        currentData[i].messages.push(message.content.replace('.log ', ''));
                    }
                }
            } else {
                // new user
                currentData[message.member.user.tag] = {
                    messages: [message.content.replace('.log ', '')]
                };
            }

            fs.writeFile('data/log.json', JSON.stringify(currentData), (err) => {
                console.error(err)
            });
        });
    },
};