const {StringStream} = require("scramjet");
const request = require("request");
const username = process.env.name;
const apikey = process.env.apikey;
const plotly = require('plotly')(username, apikey);
const fs = require('fs');
const recovered = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv";
const confirmed = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv";
const deaths = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv";

module.exports = {
    name: 'cv',
    description: 'cv!',
    execute(message, args, client) {

        let url;

        // Check if args[0] is r or d, else apply c (default)
        if (args[0].length === 1) { // Its one of the 3 mentioned above

            if (args[0] === 'd')
                url = deaths;
            else if (args[0] === 'r')
                url = recovered;
            else
                url = confirmed;
        } else
            url = confirmed; // Default case


        let country = "";
        if (args[0] === 'c' || args[0] === 'r' || args[0] === 'd') { // One of the default chars was used, remove it.
            country = country.concat(args).replace(/,/g, " ").replace(args[0] + " ", "");
        } else { // Country isn't polluted by a url modifier.
            country = country.concat(args).replace(/,/g, " ");
        }

        getData(url);

        /**
         * Parses url and prints the relevant filtered data
         * @param source
         */
        function getData(source) {
            let rows = [];
            request.get(source) // Grabs data from the provided url
                .pipe(new StringStream()) // Pipes it into a string stream
                .CSVParse() // parses it (csv format)
                .consume(object => rows.push(object)) // pushes everything into rows[]
                .then(() => {
                    let arr = searchRow(rows, country); // Generates the array we want
                    let finalArray = formatForGraph(filterCasesDupes(filterCasesEmpty(arr))); // Filters out dates with no case number difference and dates with 0 cases
                    // message.channel.send(discordToString(finalArray)); // Sends data on discord in the form of a json document
                    generateGraph(finalArray);
                });
        }

        /**
         * Returns all dates along with the cases recorded for the said date as an array of objects
         * @param arr
         * @param index
         * @returns {[]}
         */
        function getRowData(arr, index) {
            let finalArray = [];

            for (let i = 4; i < arr[0].length; i++) { // Dates start from index 4
                finalArray.push({
                    "date": arr[0][i],
                    "value": parseInt(arr[index][i])
                });
            }
            return finalArray;
        }

        /**
         * Searches the row that contains the passed country and returns it. This also can return all countries with or without china.
         * @param data
         * @param country
         * @returns {*[]}
         */
        function searchRow(data, country) {
            if (country === 'all') {
                return sumCases(data, null, true)
            } else if (country === 'other') {
                return sumCases(data, null, false);
            } else {
                return sumCases(data, country, true);
            }
        }

        /**
         * Returns the total amount of cases for a specific country or for all countries with or without china
         * @param arr
         * @param country
         * @param includeChina
         * @returns {[]}
         */
        function sumCases(arr, country, includeChina) {
            let first = true;
            let initialRow = [];
            let currentRow = [];

            for (let i = 0; i < arr.length; i++) { // Loops through the entire array
                if (country) { // If a country is given
                    if (includesCountry(arr, i, country)) {
                        if (first) { // The first time this is ran (and hits) we want to update initialRow
                            initialRow = getRowData(arr, i);
                            first = false;
                        } else { // All other hits are added on top
                            currentRow = getRowData(arr, i);
                            initialRow = sumRows(initialRow, currentRow)
                        }
                    }
                } else { // This is either all or other
                    if (includeChina) { // All
                        initialRow = getRowData(arr, i);
                        for (let i = 2; i < arr.length; i++) { // Start from index 2 since 0 is format and 1 is initialRow
                            currentRow = getRowData(arr, i);
                            initialRow = sumRows(initialRow, currentRow)
                        }
                    } else { // Other
                        initialRow = getRowData(arr, i);
                        for (let i = 2; i < arr.length; i++) { // Start from index 2 since 0 is format and 1 is initialRow
                            if (!includesCountry(arr, i, 'china')) { // China must not be included in the row
                                currentRow = getRowData(arr, i);
                                initialRow = sumRows(initialRow, currentRow);
                            }
                        }
                    }
                }
            }
            return initialRow;
        }

        /**
         * Sums the values of 2 rows
         * @param row1
         * @param row2
         * @returns {*}
         */
        function sumRows(row1, row2) {
            for (let i = 0; i < row1.length; i++)
                row1[i].value += row2[i].value;
            return row1;
        }

        /**
         * Returns true if the passed country is the country of the passed row
         * @param arr
         * @param index
         * @param country
         * @returns {boolean}
         */
        function includesCountry(arr, index, country) {
            let check = "";
            if (arr[index][0])
                check += arr[index][0].toLowerCase() + " ";
            if (arr[index][1])
                check += arr[index][1].toLowerCase() + " ";

            return check.includes(country);
        }

        /**
         * Filters out days that have 0 cases (preference)
         * @param arr
         * @returns {[]}
         */
        function filterCasesEmpty(arr) {
            let finalArray = [];

            for (let i = 0; i < arr.length; i++)
                if (arr[i].value !== 0)
                    finalArray.push(arr[i]);

            return finalArray;
        }

        /**
         * Filters out days that have the same amount of cases (preference)
         * @param arr
         * @returns {[]}
         */
        function filterCasesDupes(arr) {
            let finalArray = [];

            for (let i = 0; i < arr.length; i++)
                if (i > 0 && arr[i].value !== arr[i - 1].value)
                    finalArray.push(arr[i]);

            return finalArray;
        }

        /**
         * Converts array into a JSON string and makes it readable for discord
         * @param arr
         * @returns {string}
         */
        function discordToString(arr) {
            return '```JSON\n' + JSON.stringify(arr) + '```';
        }

        /**
         * Formats the date appropriately for plotly
         * @param arr
         * @returns {[]}
         */
        function formatForGraph(arr) {
            let arrFinal = [];

            for (let i = 0; i < arr.length; i++) {
                let temp = arr[i].date.split('/');
                arrFinal.push({
                    'date': `${temp[2]}-${temp[0]}-${temp[1]}`,
                    'value': arr[i].value
                });
            }
            return arrFinal;
        }

        /**
         * Generates a graph from the given data, exports it as a png file and sends it
         * @param arr
         */
        function generateGraph(arr) {

            message.channel.startTyping();

            let dates = [];
            let values = [];

            for (let i = 0; i < arr.length; i++) {
                dates.push(arr[i].date);
                values.push(arr[i].value);
            }

            let trace = {
                x: dates,
                y: values,
                fill: 'tonexty',
                type: "scatter",
                name: setName(args[0]),
                line: {
                    color:setColor(args[0])
                },
            };

            let figure = { 'data': [trace] };

            let imgOpts = {
                format: 'jpeg',
                width: 1000,
                height: 500,
            };

            plotly.getImage(figure, imgOpts, function (error, imageStream) {
                if (error) return console.log (error);

                let fileStream = fs.createWriteStream('1.jpeg');
                imageStream.pipe(fileStream);

                setTimeout(() => {
                    message.channel.send({files: ['1.jpeg']}).then(message.channel.stopTyping())
                }, 100)
            });
        }

        /**
         * Used to generate the curve color based on whether confirmed, deaths or recovered were queried.
         * @param str
         * @returns {string}
         */
        function setColor(str) {
            let color = '';

            if (str === 'd')
                color = "rgba(82, 75, 75, 1)";
            else if (str === 'r')
                color = "rgba(36, 221, 23, 1)";
            else
                color = "rgba(31, 119, 180, 1)";

            return color;
        }

        /**
         * Generates a curve name. Only visible once you start displaying 2 curves in the same graph.
         * @param str
         */
        function setName(str) {
            let txt = '';
            if (str === 'd')
                txt = `Deaths (${country})`;
            else if (str === 'r')
                txt = `Recovered (${country})`;
            else
                txt = `Confirmed cases (${country})`;
        }
    },
};