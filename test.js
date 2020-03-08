const {StringStream} = require("scramjet");
const request = require("request");

let rows = [];

let recovered = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv";
let confirmed = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv";
let deaths = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv";
let url;
// console.log(process.argv[2] === "r");
if (process.argv[2] === "r")
    url = recovered;
else if (process.argv[2] === "d")
    url = deaths;
else
    url = confirmed;

request.get(url)// fetch csv (default is confirmed)
    .pipe(new StringStream())                       // pass to stream
    .CSVParse()                                   // parse into objects
    .consume(object => rows.push(object))  // do whatever you like with the objects
    .then(() => {
        // check amount of arguments given
        if (process.argv[3]){
            if (process.argv[4]){
                if (process.argv[5])
                    toStringSearchRow(rows, process.argv[3] + " " + process.argv[4] + " " + process.argv[5]);
                else
                    toStringSearchRow(rows, process.argv[3] + " " + process.argv[4]);
            }
            else
                toStringSearchRow(rows, process.argv[3])
        }
        else
            console.log('No args given')
    });

// Returns all cases of the given country
function toStringRow(format, arr) {// NOTE I SHOULD CHANGE THE FOLLOWING 2 INTO ONE PRINT THAT ALWAYS PRINTS SOMETHING
    if (arr[0])
        console.log(`${format[0]}: ${arr[0]}`);// Prints "Province/State:"
    else
        console.log(`${format[1]}: ${arr[1]}\n`);// Prints "Province/State:"

    if (process.argv[2] === "r")
        console.log('Date || Total Recovered Cases\n');
    else if (process.argv[2] === "d")
        console.log('Date || Total Deaths\n');
    else
        console.log('Date || Total Confirmed Cases\n');

    let res = [];

    for (var i = 4; i < format.length; i++)
        if (arr[i-1] !== arr[i] && arr[i] != 0)// This removes dates that had no extra cases (preference) as well as dates with 0 cases
            res.push({format: format[i], row: arr[i]});

    return res;
}

function toStringSearchRow(data, region) {
    for (let i = 1; i < data.length; i++){

        if (data[i][0].toLowerCase() === region.toLowerCase() || data[i][1].toLowerCase() === region.toLowerCase()){// csv was inconsistent so had to check both
            toStringRow(data[0], data[i]).forEach(e => {
                console.log(`${e.format} || ${e.row}`)
            });
            break;
        }
    }
}