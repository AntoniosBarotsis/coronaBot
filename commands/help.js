const prefix = process.env.prefix

module.exports = {
    name: 'help',
    description: 'Shows information on commands',
    usage: '``' + prefix + 'help``',
    show: true,
    execute (message, args, client) {
        const Discord = require('discord.js')

        const myCommands = client.commands
        const str = ''
        const command = str.concat(args).replace(/,/g, ' ')

        if (!command) { // if no command is supplied, show all commands
            const embed = new Discord.MessageEmbed().setColor('#36bee6').setTitle('Commands')

            const commandNames = myCommands.keyArray()
            commandNames.forEach(e => {
                if (myCommands.get(e).show) { embed.addField(`**${prefix}${e}**`, myCommands.get(e).description) }
            })

            message.channel.send(embed)
        } else { // else show info for the supplied command
            if (myCommands.has(command)) { // check if it exists first
                const commandInfo = myCommands.get(command)
                if (commandInfo.show) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setColor('#36bee6')
                        .setTitle(`Command: ${commandInfo.name}`)
                        .addField('Description:', commandInfo.description)
                        .addField('Usage:', `${commandInfo.usage}`))
                }
            } else { message.channel.send('Invalid command name') }
        }
    }
}
