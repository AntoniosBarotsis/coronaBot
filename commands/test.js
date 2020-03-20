const plotly = require('plotly')('Tony_','U0TugGb9QBf7IozlI4Wd');
const fs = require('fs');

module.exports = {
    name: 'test',
    description: 'Testing stuff',
    usage: "``.test``",
    execute(message, args, client) {

        message.channel.startTyping();
        let trace1 = {
            x: [1, 2, 3, 4],
            y: [10, 15, 13, 17],
            type: "scatter"
        };

        let figure = { 'data': [trace1] };

        let imgOpts = {
            format: 'png',
            width: 1000,
            height: 500
        };

        plotly.getImage(figure, imgOpts, function (error, imageStream) {
            if (error) return console.log (error);

            let fileStream = fs.createWriteStream('1.png');
            imageStream.pipe(fileStream);

            setTimeout(() => {
                message.channel.send({files: ['1.png']}).then(message.channel.stopTyping())
            }, 1000)
        });

    }
};