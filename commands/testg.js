const fs = require('fs')
const axios = require('axios')

module.exports = {
    name: 'testg',
    description: 'Testing stuff',
    usage: 'testg',
    show: false,
    execute (message, args) {
        message.channel.startTyping()

        const dates = ['1/22/20', '1/23/20', '1/24/20', '1/25/20', '1/26/20', '1/27/20', '1/28/20', '1/29/20', '1/30/20', '1/31/20',
            '2/1/20', '2/2/20', '2/3/20', '2/4/20', '2/5/20', '2/6/20', '2/7/20', '2/8/20', '2/9/20', '2/10/20', '2/11/20', '2/12/20',
            '2/13/20', '2/14/20', '2/15/20', '2/16/20', '2/17/20', '2/18/20', '2/19/20', '2/20/20', '2/21/20', '2/22/20', '2/23/20',
            '2/24/20', '2/25/20', '2/26/20', '2/27/20', '2/28/20', '2/29/20', '3/1/20', '3/2/20', '3/3/20', '3/4/20', '3/5/20', '3/6/20',
            '3/7/20', '3/8/20', '3/9/20', '3/10/20', '3/11/20', '3/12/20', '3/13/20', '3/14/20', '3/15/20', '3/16/20', '3/17/20', '3/18/20', '3/19/20',
            '3/20/20', '3/21/20', '3/22/20', '3/23/20', '3/24/20', '3/25/20']

        const values = [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 20, 62, 155, 229, 322, 453, 655, 888, 1128, 1694, 2036,
            2502, 3089, 3858, 4636, 5883, 7375, 9172, 10149, 12462, 12462, 17660, 21157, 24747, 27980, 31506, 35713, 41035, 47021, 53578, 59138, 63927, 69176, 74386]

        const datesFinal = []
        const valuesFinal = []

        for (let i = 0; i < dates.length; i++) {
            const arr = dates[i].split('/')
            if (values[i] !== 0) {
                datesFinal.push(`${arr[2]}-${arr[0]}-${arr[1]}`)
                valuesFinal.push(values[i])
            }
        }

        /*
        for chart.data.label, make a check to what flag was used (c,d,r) and write sth like 'Number of {Confirmed Cases}{Deaths}{Recoveries} in ${coutry}'
         */
        const chartData = {
            backgroundColor: 'rgba(44,47,51, 1)',
            width: 1000,
            height: 500,
            format: 'jpg',
            chart: {
                type: 'line',
                data: {
                    labels: datesFinal,
                    datasets: [{
                        label: 'Number of confirmed cases in Italy',
                        data: valuesFinal,
                        fill: true,
                        backgroundColor: 'rgba(126,255,105, 1)'
                    }]
                },
                options: {
                    // elements: {
                    //     point:{
                    //         radius: 0
                    //     }
                    // },
                    legend: {
                        labels: {
                            fontColor: 'orange'
                        }
                    }
                }
            }
        }

        axios({
            method: 'post',
            url: 'https://quickchart.io/chart',
            responseType: 'stream',
            data: chartData
        })
            .then((res) => {
                // pipe image into writestream and send image when done
                res.data.pipe(fs.createWriteStream('1.jpeg'))
                    .on('finish', () => {
                        message.channel.send({ files: ['1.jpeg'] }).then(message.channel.stopTyping())
                    })
                    .on('error', () => {
                        // if can't convert to pic, do error func here
                    })
            })
            .catch((err) => {
                console.error(err)
            })

    // function formatDates(arr) {
    //     let ret = [];
    //     for (let i = 0; i < arr.length; i++) {
    //         ret[i] = formatDate(arr[i].date)
    //     }
    // }
    //
    // function translateDate(date) {
    //
    // }
    }
}
