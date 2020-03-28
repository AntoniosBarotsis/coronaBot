const Discord = require('discord.js');
const fs = require('fs');
require('dotenv').config({path: './../.env'});
const token = process.env.token;
const prefix = process.env.prefix;
const commandFiles = fs.readdirSync('./../commands').filter(file => file.endsWith('.js'));

let arr = new Discord.Collection();

for (const file of commandFiles) {
    const command = require(`./../commands/${file}`);
    arr.set(command.name, command);
}

const myCommands = arr;
const commandNames = myCommands.keyArray();

async function getCommand(cmd) {
    for (let i in commandNames) {
        if (myCommands.get(commandNames[i]).name === cmd)
            return commandNames[i];
    }
    return false;
}

getCommand('ping').then(res => {
    console.log(`Result: ${myCommands.get(res)}`);
});
