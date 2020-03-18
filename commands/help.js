module.exports = {
    name: "help",
    description: "help",
    usage: "``.help``",
    execute(message, args, client) {
        const Discord = require('discord.js');

        const myCommands = client.commands;
        let str = "";
        const command = str.concat(args).replace(/,/g, " ");
        client.startTyping;

        if (!command) { // if no command is supplied, show all commands
            let embed = new Discord.MessageEmbed().setColor('#36bee6').setTitle('Commands');

            const commandNames = myCommands.keyArray();
            commandNames.forEach(e => embed.addField(`**${e}**`, myCommands.get(e).description));

            message.channel.send(embed).then(client.stopTyping);
        }else { // else show info for the supplied command
            if (myCommands.has(command)) { // check if it exists first
                const commandInfo = myCommands.get(command);
                message.channel.send(new Discord.MessageEmbed()
                    .setColor('#36bee6')
                    .setTitle(`Command: ${commandInfo.name}`)
                    .addField('Description:', commandInfo.description)
                    .addField('Usage:', commandInfo.usage)).then(client.stopTyping)
            }else
                message.channel.send('Invalid command name').then(client.stopTyping)
        }
    },
};