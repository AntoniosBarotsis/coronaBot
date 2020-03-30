const prefix = process.env.prefix
const population = require('./../data/population')

module.exports = {
    name: 'testp',
    description: 'Testing some population data',
    usage: '``' + prefix + 'testp``',
    show: false,
    execute (message, args) {
        for (const i in population) {
            if (population[i].country.toLowerCase() === 'greece') { message.channel.send(population[i].population) }
        }
    }
}
