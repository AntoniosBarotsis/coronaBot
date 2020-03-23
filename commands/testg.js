const username = process.env.name;
const apikey = process.env.apikey;
const plotly = require('plotly')(username, apikey);
const fs = require('fs');

module.exports = {
    name: 'testg',
    description: 'Testing stuff',
    usage: "testg",
    show: false,
    execute(message, args) {

        let dates = ['1/22/20','1/23/20','1/24/20','1/25/20','1/26/20','1/27/20','1/28/20','1/29/20','1/30/20','1/31/20',
            '2/1/20','2/2/20','2/3/20','2/4/20','2/5/20','2/6/20','2/7/20','2/8/20','2/9/20','2/10/20','2/11/20','2/12/20',
            '2/13/20','2/14/20','2/15/20','2/16/20','2/17/20','2/18/20','2/19/20','2/20/20','2/21/20','2/22/20','2/23/20',
            '2/24/20','2/25/20','2/26/20','2/27/20','2/28/20','2/29/20','3/1/20','3/2/20','3/3/20','3/4/20','3/5/20','3/6/20',
            '3/7/20','3/8/20','3/9/20','3/10/20','3/11/20','3/12/20','3/13/20','3/14/20','3/15/20','3/16/20','3/17/20','3/18/20','3/19/20'];

        let values = [0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,20,62,155,229,322,453,655,888,1128,1694,2036,
            2502,3089,3858,4636,5883,7375,9172,10149,12462,12462,17660,21157,24747,27980,31506,35713,41035];

        let datesFinal = [];
        let valuesFinal = [];

        for (let i = 0; i < dates.length; i++){
            let arr = dates[i].split('/');
            if (values[i] !== 0) {
                datesFinal.push(`${arr[2]}-${arr[0]}-${arr[1]}`);
                valuesFinal.push(values[i])
            }
        }
        message.channel.startTyping();
        let trace1 = {
            x: datesFinal,
            y: valuesFinal,
            fill: 'tonexty',
            type: "scatter",
            name: "Confirmed cases (Italy)",
            line: {
                color:"rgba(31, 119, 180, 1)"// blue
                // color:"rgba(206, 28, 28, 1)"// red
                // color:"rgba(36, 221, 23, 1)"// green
                // color:"rgba(82, 75, 75, 1)"// grey
            },
        };
        //
        // let trace2 = {
        //     x: datesFinal,
        //     y: values2,
        //     fill: 'tozeroy',
        //     type: "scatter",
        //     name: "Confirmed cases (Italy)/2",
        //     line: {
        //         // color:"rgba(31, 119, 180, 1)"
        //         color:"rgba(206, 28, 28, 1)"
        //         // color:"rgba(36, 221, 23, 1)"
        //         // color:"rgba(82, 75, 75, 1)"
        //     },
        // };

        let figure = { 'data': [trace1] };

        let imgOpts = {
            format: 'png',
            width: 1000,
            height: 500,
        };

        plotly.getImage(figure, imgOpts, function (error, imageStream) {
            if (error) return console.log (error);

            let fileStream = fs.createWriteStream('1.png');
            imageStream.pipe(fileStream);

            setTimeout(() => {
                message.channel.send({files: ['1.png']}).then(message.channel.stopTyping())
            }, 300)
        });

    }
};