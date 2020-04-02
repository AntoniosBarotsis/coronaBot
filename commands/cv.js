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
    usage: '``' + prefix + 'cv [c/r/d] [country] [flag]``\nIf the first argument is left out, c is being selected by ' +
      'default. Instead of a specific country the bot supports ``all`` for all countries and ``other``' +
      ' for all countries other than china.\nSupported flags are:\n - pie: Returns a pie chart (this is always c)',
    show: true,
    execute: function(message, args) {
        let flag;

        // Check if args[0] is r or d, else apply c (default).
        if (args[0].length === 1) { // Its one of the 3 mentioned above.
            flag = args[0];
        } else {
            flag = 'c';
        } // Default case

        let country = '';
        if (args[0] === 'c' || args[0] === 'r' || args[0] === 'd') { // One of the default chars was used, remove it.
            country = utility.replaceKnownCountry(country.concat(args).replace(/,/g, ' ').replace(args[0] + ' ', ''));
        } else { // Country isn't polluted by a url modifier.
            country = utility.replaceKnownCountry(country.concat(args).replace(/,/g, ' '));
        }

        let pie = false;
        if (country.includes(' pie')) {
            country = country.replace(' pie', '');
            pie = true;
        }

        const urlData = [];

        // This part checks the first flag and adds the relevant data to urlData.
        // Eventually there will be a second part like this that will add data for the second country.
        // if (flag === 'c') {
        //     urlData.push(getData(confirmed));
        // } else if (flag === 'd') {
        //     urlData.push(getData(deaths));
        // } else {
        //     urlData.push(getData(recovered));
        // }

        urlData.push(getData(confirmed));
        urlData.push(getData(deaths));
        urlData.push(getData(recovered));

        Promise.all(urlData).then(arr => {
            if (pie) {
                let populationData = utility.populationData(country, arr[0][arr[0].length - 1].value, arr[1][arr[1].length - 1].value,
                    arr[2][arr[2].length - 1].value, utility.getPopulation(country, population));
                generatePieChart(populationData);
            } else {
                generateGraph(arr[0]);
            }
        });

        function getData(source) {
            const rows = [];
            return new Promise(function(resolve, reject) {
                request.get(source) // Grabs data from the provided url
                    .pipe(new StringStream()) // Pipes it into a string stream
                    .CSVParse() // parses it (csv format)
                    .consume(object => rows.push(object)) // pushes everything into rows[]
                    .then(() => {
                        const arr = searchRow(rows, country); // Generates the array we want
                        // eslint-disable-next-line max-len
                        const finalArray = utility.formatForGraph(utility.filterCasesDecreasing(utility.filterCasesDupes(utility.filterCasesEmpty(arr)))); // Filters out stuff, configure this as you like
                        resolve(finalArray);
                    }).catch(error => {
                        console.error(error);
                    });
            });
        }

        function searchRow(data, country) {
            if (country === 'all') {
                return sumCases(data, null, true);
            } else if (country === 'other') {
                return sumCases(data, null, false);
            } else {
                return sumCases(data, country, true);
            }
        }

        function sumCases(arr, country, includeChina) {
            let first = true;
            let initialRow = [];
            let currentRow = [];

            for (let i = 0; i < arr.length; i++) { // Loops through the entire array
                if (country) { // If a country is given
                    if (utility.includesCountry(arr, i, country)) {
                        if (first) { // The first time this is ran (and hits) we want to update initialRow
                            initialRow = utility.getRowData(arr, i);
                            first = false;
                        } else { // All other hits are added on top
                            currentRow = utility.getRowData(arr, i);
                            initialRow = utility.sumRows(initialRow, currentRow);
                        }
                    }
                } else { // This is either all or other
                    if (includeChina) { // All
                        initialRow = utility.getRowData(arr, i);
                        for (let i = 2; i < arr.length; i++) {
                            currentRow = utility.getRowData(arr, i);
                            initialRow = utility.sumRows(initialRow, currentRow);
                        }
                    } else { // Other
                        initialRow = utility.getRowData(arr, i);
                        for (let i = 2; i < arr.length; i++) {
                            if (!utility.includesCountry(arr, i, 'china')) { // China must not be included in the row
                                currentRow = utility.getRowData(arr, i);
                                initialRow = utility.sumRows(initialRow, currentRow);
                            }
                        }
                    }
                }
            }
            return initialRow;
        }

        function generateGraph(arr) {
            message.channel.startTyping();

            const dates = [];
            const values = [];

            for (let i = 0; i < arr.length; i++) {
                dates.push(arr[i].date);
                values.push(arr[i].value);
            }

            const valuesChange = utility.getChange(values);

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
                        labels: dates,
                        datasets: [{
                            label: '(Experimental) rate of change',
                            data: valuesChange,
                            fill: true,
                            backgroundColor: 'rgba(0,0,255, 1)',
                        }, {
                            label: utility.getGraphLabel(country, flag),
                            data: values,
                            fill: true,
                            backgroundColor: utility.getGraphColor(flag),
                        }],
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
                            text: `Confirmed cases in ${country.charAt(0).toUpperCase() + country.slice(1)}: ${objectData.populationC} (${objectData.confirmedOverPop}%)`,
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
