const { StringStream } = require('scramjet')
const request = require('request')
const axios = require('axios')
const prefix = process.env.prefix
const fs = require('fs')
// const population = require('./../data/population')
const recovered = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv'
const confirmed = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv'
const deaths = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'

module.exports = {
    name: 'cv',
    description: 'Displays number of confirmed/deaths/recovered cases of covid-19 on specific countries.',
    usage: '``' + prefix + 'cv [c/r/d] [country]``\nIf the first argument is left out, c is being selected by ' +
      'default. Instead of a specific country the bot supports ``all`` for all countries and ``other``' +
      ' for all countries other than china.',
    show: true,
    execute: function (message, args) {
        let flag

        // Check if args[0] is r or d, else apply c (default).
        if (args[0].length === 1) { // Its one of the 3 mentioned above.
            flag = args[0]
        } else {
            flag = 'c'
        } // Default case

        let country = ''
        if (args[0] === 'c' || args[0] === 'r' || args[0] === 'd') { // One of the default chars was used, remove it.
            country = replaceKnownCountry(country.concat(args).replace(/,/g, ' ').replace(args[0] + ' ', ''))
        } else { // Country isn't polluted by a url modifier.
            country = replaceKnownCountry(country.concat(args).replace(/,/g, ' '))
        }

        // if (country.includes('pop')) {
        //     toPopulation = true;
        //     country = country.replace(' pop', '');
        // }

        // Handle some cases like these here

        const urlData = []

        // This part checks the first flag and adds the relevant data to urlData.
        // Eventually there will be a second part like this that will add data for the second country.
        if (flag === 'c') {
            urlData.push(getData(confirmed))
        } else if (flag === 'd') {
            urlData.push(getData(deaths))
        } else {
            urlData.push(getData(recovered))
        }

        Promise.all(urlData).then(arr => {
            generateGraph(arr[0])
        })

        /**
     * Parses url and prints the relevant filtered data.
     * @param source
     */
        function getData (source) {
            const rows = []
            return new Promise(function (resolve, reject) {
                request.get(source) // Grabs data from the provided url
                    .pipe(new StringStream()) // Pipes it into a string stream
                    .CSVParse() // parses it (csv format)
                    .consume(object => rows.push(object)) // pushes everything into rows[]
                    .then(() => {
                        const arr = searchRow(rows, country) // Generates the array we want
                        // eslint-disable-next-line max-len
                        const finalArray = formatForGraph(filterCasesDecreasing(filterCasesDupes(filterCasesEmpty(arr)))) // Filters out stuff, configure this as you like
                        resolve(finalArray)
                    }).catch(error => {
                        console.error(error)
                    })
            })
        }

        /**
     * Returns all dates along with the cases recorded for the said date as an array of objects.
     * @param arr
     * @param index
     * @returns {[]}
     */
        function getRowData (arr, index) {
            const finalArray = []

            for (let i = 4; i < arr[0].length; i++) { // Dates start from index 4
                finalArray.push({
                    date: arr[0][i],
                    value: parseInt(arr[index][i], 10)
                })
            }
            return finalArray
        }

        /**
     * Searches the row that contains the passed country and returns it.
     * This also can return all countries with or without china.
     * @param data
     * @param country
     * @returns {*[]}
     */
        function searchRow (data, country) {
            if (country === 'all') {
                return sumCases(data, null, true)
            } else if (country === 'other') {
                return sumCases(data, null, false)
            } else {
                return sumCases(data, country, true)
            }
        }

        /**
     * Returns the total amount of cases for a specific country or for all countries with or without china.
     * @param arr
     * @param country
     * @param includeChina
     * @returns {[]}
     */
        function sumCases (arr, country, includeChina) {
            let first = true
            let initialRow = []
            let currentRow = []

            for (let i = 0; i < arr.length; i++) { // Loops through the entire array
                if (country) { // If a country is given
                    if (includesCountry(arr, i, country)) {
                        if (first) { // The first time this is ran (and hits) we want to update initialRow
                            initialRow = getRowData(arr, i)
                            first = false
                        } else { // All other hits are added on top
                            currentRow = getRowData(arr, i)
                            initialRow = sumRows(initialRow, currentRow)
                        }
                    }
                } else { // This is either all or other
                    if (includeChina) { // All
                        initialRow = getRowData(arr, i)
                        for (let i = 2; i < arr.length; i++) {
                            currentRow = getRowData(arr, i)
                            initialRow = sumRows(initialRow, currentRow)
                        }
                    } else { // Other
                        initialRow = getRowData(arr, i)
                        for (let i = 2; i < arr.length; i++) {
                            if (!includesCountry(arr, i, 'china')) { // China must not be included in the row
                                currentRow = getRowData(arr, i)
                                initialRow = sumRows(initialRow, currentRow)
                            }
                        }
                    }
                }
            }
            return initialRow
        }

        /**
     * Sums the values of 2 rows.
     * @param row1
     * @param row2
     * @returns {*}
     */
        function sumRows (row1, row2) {
            for (let i = 0; i < row1.length; i++) {
                row1[i].value += row2[i].value
            }
            return row1
        }

        /**
     * Returns true if the passed country is the country of the passed row (uses regex
     * o make sure Australia doesnt get matched if the user inputs us for example).
     * @param arr
     * @param index
     * @param country
     * @returns {boolean}
     */
        function includesCountry (arr, index, country) {
            let check = ''
            if (arr[index][0]) {
                check += arr[index][0].toLowerCase() + ' '
            }
            if (arr[index][1]) {
                check += arr[index][1].toLowerCase() + ' '
            }

            return check.match(`\\b${country.toLowerCase()}\\b`)
        }

        /**
     * Filters out days that have 0 cases.
     * @param arr
     * @returns {[]}
     */
        function filterCasesEmpty (arr) {
            const finalArray = []

            for (let i = 0; i < arr.length; i++) {
                if (arr[i].value !== 0) {
                    finalArray.push(arr[i])
                }
            }

            return finalArray
        }

        /**
     * Filters out days that have the same amount of cases (keeps the first one).
     * @param arr
     * @returns {[]}
     */
        function filterCasesDupes (arr) {
            const finalArray = []

            for (let i = 0; i < arr.length; i++) {
                if (i === 0) {
                    finalArray.push(arr[i])
                } else if (arr[i].value !== arr[i - 1].value) {
                    finalArray.push(arr[i])
                }
            }

            return finalArray
        }

        /**
     * In some cases the CSV file would decrease cases moving onwards
     * which is impossible and quite possible an error, fixing it here.
     * @param arr
     * @returns {[]}
     */
        function filterCasesDecreasing (arr) {
            const finalArray = []

            for (let i = 0; i < arr.length; i++) {
                if (i === 0) {
                    finalArray.push(arr[i])
                } else if (arr[i].value >= arr[i - 1].value) {
                    finalArray.push(arr[i])
                }
            }

            return finalArray
        }

        // /**
        //  * Converts array into a JSON string and makes it readable for discord.
        //  * @param arr
        //  * @returns {string}
        //  */
        // function discordToString (arr) {
        //     return '```JSON\n' + JSON.stringify(arr) + '```'
        // }

        /**
     * Formats the date appropriately for plot.ly.
     * @param arr
     * @returns {[]}
     */
        function formatForGraph (arr) {
            const arrFinal = []

            for (let i = 0; i < arr.length; i++) {
                const temp = arr[i].date.split('/')
                arrFinal.push({
                    date: `${temp[2]}-${temp[0]}-${temp[1]}`,
                    value: arr[i].value
                })
            }
            return arrFinal
        }

        /**
     * Generates a graph from the given data, exports it as a jpeg file and sends it.
     * @param arr
     */
        function generateGraph (arr) {
            message.channel.startTyping()

            const dates = []
            const values = []

            for (let i = 0; i < arr.length; i++) {
                dates.push(arr[i].date)
                values.push(arr[i].value)
            }

            const valuesChange = getChange(values)

            if (values.length === 0) {
                message.channel.send('There seems to be no data available for your query, please try again!\n\n' +
            'If your spelling is correct be sure to mention that using' +
            '``.log [country to fix]`` so I fix it later.')
                message.channel.stopTyping()
                return
            }

            const chartData = {
                backgroundColor: 'rgba(44,47,51, 1)',
                width: 1000,
                height: 500,
                format: 'jpg',
                chart: {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: '(Experimental) rate of change',
                            data: valuesChange,
                            fill: true,
                            backgroundColor: 'rgba(0,0,255, 1)'
                        }, {
                            label: getGraphLabel(),
                            data: values,
                            fill: true,
                            backgroundColor: getGraphColor()
                        }]
                    },
                    options: {
                        legend: {
                            labels: {
                                fontColor: 'white'
                            }
                        }
                    }
                }
            }

            // post req. with params to create our chart
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
                })
                .catch((err) => {
                    console.error(err)
                })
        }

        // function getPopulation (country) {
        //     let num = 0
        //     for (const i in population) {
        //         if (population[i].country.toLowerCase() === 'greece') {
        //             num = population[i].population
        //         }
        //     }
        //     return num
        // }

        // /**
        //  *
        //  * @param country
        //  * @param arrC
        //  */
        // function populationData (country, arrC) {
        //     let msg = ''
        //     const pop = getPopulation(country)
        //     const confirmedOverPop = (100 * arrC[arrC.length - 1].value / pop).toFixed(2)
        //
        //     msg += `Percentage of the population that has been infected: ${confirmedOverPop}%`
        //     return msg
        // }

        /**
     * Returns the color that corresponds to the given flag
     * @returns {string}
     */
        function getGraphColor () {
            if (flag === 'r') {
                return 'rgba(0,200,83, 1)'
            } else if (flag === 'd') {
                return 'rgba(235,40,40, 1)'
            } else {
                return 'rgba(41, 121, 255, 1)'
            }
        }

        /**
     * Returns the label that corresponds to the given flag
     * @returns {string}
     */
        function getGraphLabel () {
            let actualCountry = country.charAt(0).toUpperCase() + country.slice(1)

            if (country === 'all') {
                actualCountry = 'all countries'
            } else if (country === 'other') {
                actualCountry = 'all countries except China'
            }

            if (flag === 'r') {
                return `Recovered cases in ${actualCountry}`
            } else if (flag === 'd') {
                return `Deaths in ${actualCountry}`
            } else {
                return `Confirmed cases in ${actualCountry}`
            }
        }

        /**
     * You can now refer to usa as usa instead of us amazing
     * @param knownCountry
     * @returns {string|*}
     */
        function replaceKnownCountry (knownCountry) {
            if (knownCountry.toLowerCase() === 'vatican') {
                return 'holy see'
            } else if (knownCountry.toLowerCase() === 'usa') {
                return 'US'
            } else {
                return knownCountry
            }
        }

        function getChange (arr) {
            const finalArray = [arr[0]]

            for (let i = 1; i < arr.length; i++) {
                finalArray.push(arr[i] - arr[i - 1])
            }

            return finalArray
        }
    }
}
