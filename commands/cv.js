const { StringStream } = require('scramjet');
const request = require('request');
const axios = require('axios');
const prefix = process.env.prefix;
const fs = require('fs');
const utility = require('./../data/utility');
const population = require('./../data/population');
const recovered = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';
const confirmed = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
const deaths = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';

module.exports = {
    name: 'cv',
    description: 'Displays number of confirmed/deaths/recovered cases of covid-19 on specific countries.',
    usage: '``' + prefix + 'cv [c/r/d](optional) [country/all/other] [pie/change/compare]``\n' +
        ' - If the first argument is left out, c is being selected by default.\n' +
        ' - All: Returns data on all countries\n' +
        ' - Other: Returns data on all countries except China\n' +
        ' - pie: Returns a pie chart (this is always c)\n' +
        ' - change: Returns a line chart showing the rate of change or the corresponding modifier' +
        ' - compare allows you to query 2 countries. Example: ``.cv r greece compare romania``',
    show: true,
    execute: function(message, args) {
        if (args.length === 0) {
            message.channel.send('Please specify a country using ``.cv [country]``.');
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
        let countryP = [];

        if (country[0].includes(' pie')) {
            country[0] = country[0].replace(' pie', '');
            pie = true;
            countryP = utility.replaceKnownCountryPie(utility.removeMaliciousChars(country[0]));
        } else if (country[0].includes(' change')) {
            country[0] = country[0].replace(' change', '');
            change = true;
        } else if (country[0].includes('compare')) {
            country = country[0].split(' compare ');
            compare = true;
        }

        country = utility.replaceKnownCountry(utility.removeMaliciousChars(country));

        const urlData = [];

        urlData.push(getData(confirmed));
        urlData.push(getData(deaths));
        urlData.push(getData(recovered));

        Promise.all(urlData).then(arr => {
            if (pie) {
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
                        const arr = sumCases(rows, (country)); // Generates the array we want
                        // eslint-disable-next-line max-len
                        const finalArray = utility.formatForGraph(utility.filterCasesDecreasing(utility.filterCasesDupes(utility.filterCasesEmpty(arr)))); // Filters out stuff, configure this as you like
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
         * Generates and sends line chart
         * @param arr
         */
        function generateGraph(arr) {
            message.channel.startTyping();

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

            if (change) {
                const valuesChange = utility.getChange(values[0]);
                dataset = {
                    label: `${utility.getGraphLabel(country[0], flag)} (rate of change)`,
                    data: valuesChange,
                    fill: true,
                    backgroundColor: utility.getGraphColor(flag),
                };

                datasets.push(dataset);
            } else if (compare){
                if (values.length === 1) {
                    message.channel.send('There seems to be no data available for your query, please try again! (check your spelling)');
                    message.channel.startTyping();
                    return;
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
                // console.log(values[0].length, values[1].length, values[0].length - values[1].length);
                dataset = {
                    label: utility.getGraphLabel(country[0], flag),
                    data: values[0],
                    fill: false,
                    backgroundColor: utility.getGraphColor(flag),
                    borderColor: utility.getGraphColor(flag),
                };
                dataset2 = {
                    label: utility.getGraphLabel(country[1], flag),
                    data: values[1],
                    fill: false,
                    backgroundColor: utility.getGraphColor2(flag),
                    borderColor: utility.getGraphColor2(flag),
                };

                datasets.push(dataset);
                datasets.push(dataset2);
            } else {
                dataset = {
                    label: utility.getGraphLabel(country[0], flag),
                    data: values[0],
                    fill: true,
                    backgroundColor: utility.getGraphColor(flag),
                };

                datasets.push(dataset);
            }


            if (values.length === 0) {
                message.channel.send('There seems to be no data available for your query, please try again!\n\n' +
            'If your spelling is correct be sure to mention that using' +
            '``.log [country to fix]`` so I fix it later.');
                message.channel.stopTyping();
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
                        legend: {
                            labels: {
                                fontColor: 'white',
                            },
                        },
                    },
                },
            };

            // post req. with params to create our chart
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
                            message.channel.send({ files: ['1.jpeg'] }).then(message.channel.stopTyping());
                        });
                })
                .catch((err) => {
                    console.error(err);
                });
        }

        /**
         * Generates and sends pie chart
         * @param objectData
         */
        function generatePieChart(objectData) {
            message.channel.startTyping();

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
                            message.channel.send({ files: ['1.jpeg'] }).then(message.channel.stopTyping());
                        });
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    },
};
