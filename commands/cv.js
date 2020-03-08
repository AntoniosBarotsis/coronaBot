const Papa = require('papaparse');

module.exports = {
    name: 'cv',
    description: 'cv!',
    execute(message, args) {

        const {StringStream} = require("scramjet");
        const request = require("request");

        let rows = [];

        request.get("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv")// fetch csv
            .pipe(new StringStream())                       // pass to stream
            .CSVParse()                                   // parse into objects
            .consume(object => rows.push(object))  // do whatever you like with the objects
            .then(() => {
                console.log('Date || Confirmed Cases');
                toString(rows[0], rows[1]);
            });

        function toString(format, arr) {
            // console.log(`${format[4]}: ${arr[4]}`)
            for (var i = 4; i < format.length; i++){
                console.log(`${format[i]} || ${arr[i]}`)
            }
        }

    },
};