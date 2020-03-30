const request = require('request')
const {
    StringStream
} = require('scramjet')
const recovered = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv'
const confirmed = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv'
const deaths = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv'

let url

// Check if args[0] is c, r or d, else apply c (default)
if (process.argv[2].length === 1) { // Its one of the 3 mentioned above
    if (process.argv[2] === 'd') { url = deaths } else if (process.argv[2] === 'r') { url = recovered } else { url = confirmed }
} else { url = confirmed } // Default case

let country = ''
if (process.argv[2] === 'c' || process.argv[2] === 'r' || process.argv[2] === 'd') { // One of the default chars was used. Start country from 1
    country = country.concat(process.argv).replace(/,/g, ' ')
        .replace(process.argv[0] + ' ', '')
        .replace(process.argv[1] + ' ', '')
        .replace(process.argv[2] + ' ', '')
} else { // Url is c by default, country begins from 0
    country = country.concat(process.argv).replace(/,/g, ' ')
        .replace(process.argv[0] + ' ', '')
        .replace(process.argv[1] + ' ', '')
}

getData(url)

function getData (source) {
    const rows = []
    request.get(source)
        .pipe(new StringStream())
        .CSVParse()
        .consume(object => rows.push(object))
        .then(() => {
            const arr = searchRow(rows, country)

            for (let i = 0; i < arr.length; i++) {
                console.log(arr[i].date + ': ' + arr[i].value)
            }
        })
}

function getRowData (format, arr) {
    const bruh = []
    for (let i = 4; i < format.length; i++) {
        if (arr[i] !== 0) {
            bruh.push({
                date: format[i],
                value: arr[i]
            })
        }
    }
    return bruh
}

function searchRow (data, country) {
    for (let i = 1; i < data.length; i++) {
        if (data[i][0].toLowerCase().includes(country.toLowerCase()) || data[i][1].toLowerCase().includes(country.toLowerCase())) {
            return getRowData(data[0], data[i])
        }
    }
}
