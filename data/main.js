module.exports = {cv};

const { StringStream } = require('scramjet');
const request = require('request');
const axios = require('axios');
const fs = require('fs');
const population = require('./population');
const recovered = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';
const confirmed = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
const deaths = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
const cv_cmd = require('./../cv_cmd');
const utility = require('./utility');

function cv(args, message) {
    console.time('Entire cv command');

    if (args.length === 0) {
        if (message)
            message.channel.send('Please specify a country using cv [country].');
        else
            console.log('Please specify a country using cv [country].');
        return;
    }

    let flag;

    // Check if args[0] is r or d, else apply c (default).
    if (args[0].length === 1) { // Its one of the 3 mentioned above.
        flag = args[0];
    } else {
        flag = 'c';
    } // Default case

    let country = [];
    if (args[0] === 'c' || args[0] === 'r' || args[0] === 'd') { // One of the default chars was used, remove it.
        country[0] = args.join(' ').replace(/,/g, ' ').replace(args[0] + ' ', '');
    } else { // Country isn't polluted by a url modifier.
        country[0] = args.join(' ').replace(/,/g, ' ');
    }

    let pie = false;
    let change = false;
    let compare = false;
    let logarithmic = false;
    let top = false;
    let countryP = [];
    let topNumber;

    // Checks if user inputted any number for the top case
    let tmpTopNumber = '';
    for (let i in country[0]) {
        if (country[0][i].match(/[0-9]/)) {
            tmpTopNumber = tmpTopNumber + country[0][i];
        }
    }
    topNumber = tmpTopNumber > 0 ? tmpTopNumber : 10; // By default top will display the top countries

    if (country[0].includes('log')) {
        country[0] = country[0].replace(' log', '');
        logarithmic = true;
    }

    if (country[0].includes(' pie')) {
        country[0] = country[0].replace(' pie', '');
        pie = true;
        countryP = utility.replaceKnownCountryPie(utility.removeMaliciousChars(country[0]));
    } else {
        if (country[0].includes(' change')) {
            country[0] = country[0].replace(' change', '');
            change = true;
        }

        if (country[0].includes('top')) {
            country[0] = 'all';
            top = true;
        } else if (country[0].includes('compare')) {
            country = country[0].split(' compare ');
            compare = true;
        }
    }

    country = utility.replaceKnownCountry(utility.removeMaliciousChars(country));

    const urlData = [];

    if (message)
        message.channel.startTyping();

    if (pie) {
        urlData.push(getData(confirmed));
        urlData.push(getData(deaths));
        urlData.push(getData(recovered));
    } else {
        switch (flag) {
        case 'c':
            urlData.push(getData(confirmed));
            break;
        case 'r':
            urlData.push(getData(recovered));
            break;
        case 'd':
            urlData.push(getData(deaths));
        }
    }

    Promise.all(urlData).then(arr => {
        if (top) {
            generateBarChart(arr, flag, topNumber, top);
        } else if (pie) {
            let populationData = utility.populationData(arr[0][0][arr[0][0].length - 1], arr[1][0][arr[1][0].length - 1],
                arr[2][0][arr[2][0].length - 1], utility.getPopulation(countryP, population));
            generatePieChart(populationData);
        } else {
            if (flag === 'd')
                generateGraph(arr[1]);
            else if (flag === 'r')
                generateGraph(arr[2]);
            else
                generateGraph(arr[0]);
        }
    }).catch(err => console.error(err));

    function getData(source) {
        /**
         * Grabs data from the online csv file
         * @type {*[]}
         */
        const rows = [];
        return new Promise(function(resolve, reject) {
            request.get(source) // Grabs data from the provided url
                .pipe(new StringStream()) // Pipes it into a string stream
                .CSVParse() // parses it (csv format)
                .consume(object => rows.push(object)) // pushes everything into rows[]
                .then(() => {
                    let finalArray;

                    if (top) {
                        finalArray = getTopCases(rows);
                    } else {
                        const arr = sumCases(rows, country); // Generates the array we want
                        // Filters out stuff, configure this as you like
                        finalArray = utility.formatForGraph(utility.filterCasesDecreasing(utility.filterCasesDupes(utility.filterCasesEmpty(arr))));
                    }

                    resolve(finalArray);
                }).catch(error => {
                    console.error(error);
                });
        });
    }

    /**
     * Sums rows in case there are multiple mentions of them (for example China) as well as all and other cases
     * @param arr
     * @param country
     * @returns {[]}
     */
    function sumCases(arr, country) {
        let first = [true, true];
        let initialRow = [];
        let currentRow = [];

        for (let i = 1; i < arr.length; i++) { // Loops through the entire array
            for (let j in country) {
                if (utility.shouldSum(country[j], arr, i)) {
                    if (first[j]) {
                        initialRow[j] = utility.getRowData(arr, i);
                        first[j] = false;
                    } else {
                        currentRow[j] = utility.getRowData(arr, i);
                        initialRow[j] = utility.sumRows(initialRow[j], currentRow[j]);
                    }
                }
            }
        }
        return initialRow;
    }

    /**
     * Gets the last recorded number of each country
     * @param arr
     * @returns {country, biggestValue}
     */
    function getTopCases(arr) {
        let finalArr = [];
        let summedObj = {};
        for (let i = 1; i < arr.length; i++) {
            let currentCountry = arr[i][1] ? arr[i][1] : arr[i][0];
            let biggestValue = (change) ? arr[i][arr[i].length - 1] - arr[i][arr[i].length - 2] : arr[i][arr[i].length - 1];

            if (summedObj.hasOwnProperty(currentCountry)) {
                summedObj[currentCountry] = summedObj[currentCountry] + parseInt(biggestValue, 10);
            } else
                summedObj[currentCountry] = parseInt(biggestValue, 10);
        }

        for (let i in summedObj)
            finalArr.push({country: i, biggestValue: summedObj[i]});

        return finalArr.sort((a, b) => {
            return b.biggestValue - a.biggestValue;
        });
    }

    /**
     * Generates and sends line chart
     * @param arr
     */
    function generateGraph(arr) {
        let extraStr = '';

        if (change && logarithmic)
            extraStr = '(rate of change, logarithmic)';
        else if (change)
            extraStr = '(rate of change)';
        else if (logarithmic)
            extraStr = '(logarithmic)';

        const dates = [];
        const values = [];

        for (let i = 0; i < arr.length; i++) {
            dates[i] = [];
            values[i] = [];
            for (let j = 0; j < arr[i].length; j++) {
                dates[i].push(arr[i][j].date);
                values[i].push(arr[i][j].value);
            }
        }

        let datasets = [];
        let dataset, dataset2;

        if (compare && !top){
            if (values.length === 1) {
                let msg = 'There seems to be no data available for your query, please try again! (check your spelling)';

                if (message) {
                    message.channel.send(msg);
                    message.channel.stopTyping();
                } else
                    console.log(msg);
                return;
            }

            if (change) {
                values[0] = utility.getChange(values[0]);
                values[1] = utility.getChange(values[1]);
            }

            dates[0] = dates[0].length > dates[1].length ? dates[0] : dates[1];

            if (values[0].length > values[1].length) {
                let difference = values[0].length - values[1].length;
                for (let i = 0; i < difference; i++) {
                    values[1].unshift(0);
                }
            } else if (values[0].length < values[1].length) {
                let difference = values[1].length - values[0].length;
                for (let i = 0; i < difference; i++) {
                    values[0].unshift(0);
                }
            }

            dataset = {
                label: `${utility.getGraphLabel(country[0], flag)} ${extraStr}`,
                data: values[0],
                fill: false,
                backgroundColor: utility.getGraphColor(flag),
                borderColor: utility.getGraphColor(flag),
            };
            dataset2 = {
                label: `${utility.getGraphLabel(country[0], flag)} ${extraStr}`,
                data: values[1],
                fill: false,
                backgroundColor: utility.getGraphColor2(flag),
                borderColor: utility.getGraphColor2(flag),
            };

            datasets.push(dataset);
            datasets.push(dataset2);
        } else if (change) {
            const valuesChange = utility.getChange(values[0]);
            dataset = {
                label: `${utility.getGraphLabel(country[0], flag)} ${extraStr}`,
                data: valuesChange,
                fill: true,
                backgroundColor: utility.getGraphColor(flag),
            };

            datasets.push(dataset);
        } else {
            dataset = {
                label: `${utility.getGraphLabel(country[0], flag)} ${extraStr}`,
                data: values[0],
                fill: true,
                backgroundColor: utility.getGraphColor(flag),
            };

            datasets.push(dataset);
        }


        if (values.length === 0) {
            let msg = 'There seems to be no data available for your query, please try again! (check your spelling)';

            if (message) {
                message.channel.send(msg);
                message.channel.stopTyping();
            } else
                console.log(msg);

            return;
        }

        const chartData = {
            backgroundColor: 'rgba(44,47,51, 1)',
            width: 1000,
            height: 500,
            format: 'jpg',
            chart: {
                type: 'line',
                data: {
                    labels: dates[0],
                    datasets: datasets,
                },
                options: {
                    scales: {
                        yAxes: [{
                            type: logarithmic ? 'logarithmic' : 'linear',
                        }],
                    },
                    legend: {
                        labels: {
                            fontColor: 'white',
                        },
                    },
                },
            },
        };

        getChart(chartData);
    }

    /**
     * Generates and sends pie chart
     * @param objectData
     */
    function generatePieChart(objectData) {
        let labels, values;

        labels = ['% of cases that are still active', '% of cases that recovered', '% of cases that died'];
        values = [objectData.activeOverConfirmed, objectData.recoveredOverConfirmed, objectData.deadOverConfirmed];

        const chartData = {
            backgroundColor: 'rgba(44,47,51, 1)',
            width: 1000,
            height: 500,
            format: 'jpg',
            chart: {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: ['rgba(41, 121, 255, 1)', 'rgba(0, 200, 83, 1)', 'rgba(235, 40, 40, 1)'],
                    }],
                },
                options: {
                    title: {
                        display: true,
                        text: `Confirmed cases in ${utility.getGraphPieCountry(country[0])}: ${objectData.populationC} (${objectData.confirmedOverPop}%)`,
                    },
                    legend: {
                        labels: {
                            fontColor: 'white',
                        },
                    },
                },
            },
        };

        getChart(chartData);
    }

    /**
     * Generates a bar chart with the top n countries
     * @param arr
     */
    function generateBarChart(arr) {
        let labels = [];
        let values = [];

        let crd = flag === 'c' ? 0 : flag === 'd' ? 1 : 2;

        for (let i = 0; i < topNumber; i++) {
            labels[i] = arr[crd][i].country;
            values[i] = arr[crd][i].biggestValue;
        }

        let str = (change) ? '(by rate of change of the last day)' : '';

        const chartData = {
            backgroundColor: 'rgba(44,47,51, 1)',
            width: 1000,
            height: 500,
            format: 'jpg',
            chart: {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: utility.getBarLabel(flag),
                        backgroundColor: utility.getGraphColor(flag),
                        data: values,
                    }],
                },
                options: {
                    title: {
                        display: true,
                        text: `Top ${topNumber} countries ${str}`,
                    },
                    legend: {
                        labels: {
                            fontColor: 'white',
                        },
                    },
                },
            },
        };

        getChart(chartData);
    }

    /**
     * Generates the chart, exports it to an image and opens it
     * @param chartData
     */
    function getChart(chartData) {
        axios({
            method: 'post',
            url: 'https://quickchart.io/chart',
            responseType: 'stream',
            data: chartData,
        })
            .then((res) => {
                // pipe image into writestream and send image when done
                res.data.pipe(fs.createWriteStream('1.jpeg'))
                    .on('finish', () => {
                        console.timeEnd('Entire cv command');

                        if (message)
                            message.channel.send({ files: ['1.jpeg'] }).then(message.channel.stopTyping());
                        else
                            cv_cmd.openImage();
                    });
            })
            .catch((err) => {
                console.error(err);
            });
    }
}
