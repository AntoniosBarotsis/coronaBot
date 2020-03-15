const {StringStream} = require("scramjet");
const request = require("request");
let recovered = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv";
let confirmed = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv";
let deaths = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv";

module.exports = {
    name: 'cv',
    description: 'cv!',
    execute(message, args) {

        let url;

        // Check if args[0] is r or d, else apply c (default)
        if (args[0].length === 1) { // Its one of the 3 mentioned above

            if (args[0] === 'd')
                url = deaths;
            else if (args[0] === 'r')
                url = recovered;
            else
                url = confirmed;
        }else
            url = confirmed; // Default case


        let country = "";
        if (args[0] === 'c' || args[0] === 'r' || args[0] === 'd') { // One of the default chars was used, remove it.
            country = country.concat(args).replace(/,/g, " ").replace(args[0] + " ", "");
        }else { // Country isn't polluted by a url modifier.
            country = country.concat(args).replace(/,/g, " ");
        }

        getData(url);


        /**
         * Parses url and prints the relevant filtered data (can be modified to return it instead which can be used for plotting later on).
         * @param source
         */
        function getData (source) {
            let rows = [];
                request.get(source) // Grabs data from the provided url
                    .pipe(new StringStream()) // Pipes it into a string stream
                    .CSVParse() // parses it (csv format)
                    .consume(object => rows.push(object)) // pushes everything into rows[]
                    .then(() => {
                        let arr = searchRow(rows, country); // Generates the array we want
                        let finalArray = filterCasesDupes(filterCasesEmpty(arr)); // Filters out dates with no case number difference and dates with 0 cases
                        message.channel.send('```JSON\n' + JSON.stringify(finalArray) + '```') // Sends data on discord in the form of a json document
                    });

        }

        /**
         * Returns all dates along with the cases recorded for the said date as an array of objects
         * @param arr
         * @param index
         * @returns {[]}
         */
        function getRowData (arr, index) {
            let finalArray = [];

            for (let i = 4; i < arr[0].length; i++){ // Dates start from index 4
                finalArray.push({"date": arr[0][i], "value": parseInt(arr[index][i])});
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
            }else if (country === 'other') {
                return sumCases(data, null, false);
            } else {
                return sumCases(data, country, true);
            }
        }

        function sumCases(arr, country, includeChina) {
            let first = true;
            let initialRow = [];
            let currentRow = [];

            for (let i = 0; i < arr.length; i++) {
                if (country) {
                    if (includesCountry(arr, i, country)) {
                        if (first) {
                            initialRow = getRowData(arr, i);
                            first = false;
                        }
                        else {
                            currentRow = getRowData(arr, i);

                            for (let i2 = 0; i2 < currentRow.length; i2++)
                                initialRow[i2].value += currentRow[i2].value;
                        }
                    }
                } else { // This is either all or other
                    if (includeChina) { // All
                        initialRow = getRowData(arr, i);

                        for (let i = 2; i < arr.length; i++) { // Start from index 2 since 0 is format and 1 is initialRow
                            currentRow = getRowData(arr, i);

                            for (let i2 = 0; i2 < currentRow.length; i2++)
                                initialRow[i2].value += currentRow[i2].value;

                        }
                    } else { // Other
                        initialRow = getRowData(arr, i);

                        for (let i = 2; i < arr.length; i++) { // Start from index 2 since 0 is format and 1 is initialRow

                            if (!includesCountry(arr, i, 'china')) {
                                currentRow = getRowData(arr, i);

                                for (let i2 = 0; i2 < currentRow.length; i2++)
                                    initialRow[i2].value += currentRow[i2].value;
                            }

                        }
                    }
                }
            }
            return initialRow;
        }

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
                if (i > 0 && arr[i].value !== arr[i-1].value)
                    finalArray.push(arr[i]);

            return finalArray;
        }
    },
};
// TODO Line 83 causes the loop to break once one single region with 'china' in it is found, make it so it catches all regions and adds the values together

// TODO Consider making a function that returns an array with the summed cases of all countries that include the given name. put that in the searchRow
//  other and all cases as well as in the default case (so china works)