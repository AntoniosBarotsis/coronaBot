const Discord = require('discord.js');
const fs = require('fs');
let arr = new Discord.Collection();

module.exports = {
    getCommand: async function getCommand(cmd) {
        for (let i in commandNames) {
            if (myCommands.get(commandNames[i]).name === cmd)
                return myCommands.get(commandNames[i]);
        }
        return false;
    },

    commandFiles: fs.readdirSync('commands').filter(file => file.endsWith('.js')),
};

for (const file of module.exports.commandFiles) {
    const command = require(`./../commands/${file}`);
    arr.set(command.name, command);
}

const myCommands = arr;
const commandNames = myCommands.keyArray();

// This is me testing dw about it
// module.exports.getCommand('ping').then(res => {
//     console.log(`Result: ${res.name}`);
//     // res.execute() would normally run the function
// });
