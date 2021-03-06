module.exports = {cv};

const { StringStream } = require('scramjet');
const request = require('request');
const { CanvasRenderService } = require('chartjs-node-canvas');
const fs = require('fs');
const population = require('./data/population.json');
const recovered = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';
const confirmed = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
const deaths = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
const cv_cmd = require('./cv_cmd');
const utility = require('./data/utility.js');

function cv(args, message) {
    // console.time('Entire cv command');

    if (args.length === 0) {
        if (message)
            message.channel.send('Please specify a country using cv [country].');
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
        country[0] = args.join(' ').replace(/,/g, ' ').replace(args[0] + ' ', '').trim();
    } else { // Country isn't polluted by a url modifier.
        country[0] = args.join(' ').replace(/,/g, ' ').trim();
    }

    let pie = false;
    let change = false;
    let compare = false;
    let logarithmic = false;
    let top = false;
    let topByMortality = false;
    let combined = false;
    let combinedConfirmed = false;
    let active = false;
    let countryP = [];
    let topNumber = 10;
    let topReverse = false;

    // Checks if user inputted any number for the top case

    let tmp = country[0].split(' ');
    for (let i in tmp) {
        if (tmp[i].match(/[0-9]/))
            topNumber = tmp[i];
        else if (tmp[i] === 'r')
            topReverse = true;
    }

    // // console.log(topReverse)

    if (country[0].includes('log')) {
        country[0] = country[0].replace(' log', '');
        logarithmic = true;
    }

    if (country[0].includes(' active')) {
        country[0] = country[0].replace(' active', '');
        active = true;
        countryP = utility.replaceKnownCountryPie(utility.removeMaliciousChars(country[0]));
    }

    if (country[0].includes(' combined')) {
        if (country[0].match(/ c$/)) {
            combinedConfirmed = true;
            country[0] = country[0].replace(/ c$/, '');
        }
        country[0] = country[0].replace(' combined', '');
        combined = true;
    } else if (country[0].includes(' pie')) {
        country[0] = country[0].replace(' pie', '');
        pie = true;
        countryP = utility.replaceKnownCountryPie(utility.removeMaliciousChars(country[0]));
    } else {
        if (country[0].includes(' change')) {
            country[0] = country[0].replace(' change', '');
            change = true;
        }

        if (country[0].includes('top')) {
            if (country[0].includes('m'))
                topByMortality = true;

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

    if (pie || combined || active) {
        urlData.push(getData(confirmed));
        urlData.push(getData(deaths));
        urlData.push(getData(recovered));
    } else if (topByMortality) {
        urlData.push(getData(confirmed));
        urlData.push(getData(deaths));
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
            generateBarChart(arr, change, topByMortality, topReverse);
        } else if (pie) {
            let populationData = utility.populationData(arr[0][0][arr[0][0].length - 1], arr[1][0][arr[1][0].length - 1],
                arr[2][0][arr[2][0].length - 1], utility.getPopulation(countryP, population));
            generatePieChart(populationData);
        } else if (combined && !compare) {
            let combinedCases = utility.getCombinedCases(arr[0][0], arr[1][0], arr[2][0]);
            generateGraphCombined(combinedCases);
        } else if (active && !compare) {
            let activeArr = utility.getCombinedCases(arr[0][0], arr[1][0], arr[2][0]);
            let activeFinal = [];

            activeArr.forEach(({ active, date }) => {
                activeFinal.push({
                    date: date,
                    value: active,
                });
            });
            generateGraph([activeFinal]);
        } else {
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
                        finalArray = utility.getTopCases(rows, change, topByMortality, topReverse);
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

            dates[0] = (dates[0].length > dates[1].length) ? dates[0] : dates[1];

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
                label: `${utility.getGraphLabel(country[1], flag)} ${extraStr}`,
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
                fill: false,
                backgroundColor: utility.getGraphColor(flag),
                borderColor: utility.getGraphColor(flag),
            };

            datasets.push(dataset);
        } else {
            dataset = {
                label: `${utility.getGraphLabel(country[0], flag)} ${extraStr}`,
                data: values[0],
                fill: false,
                backgroundColor: (active) ? utility.getGraphColor('c') : utility.getGraphColor(flag),
                borderColor: (active) ? utility.getGraphColor('c') : utility.getGraphColor(flag),
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
                            ticks: {
                                autoSkip: false,
                                callback: value => {
                                    if (logarithmic) {
                                        // For every value get a base-10 mark
                                        // by looking at the length of the value
                                        let mark = Math.pow(10, String(value).length - 1);

                                        // Use this mark to select only exact
                                        // values on the Y axis. Since the axis
                                        // is logarithmic, it makes sense to
                                        // pick points at the beginning and
                                        // 1/3 of the grid segment.
                                        if (value === mark || value === mark * 3) {
                                            return value.toLocaleString('en-US');
                                        }
                                    } else {
                                        return value.toLocaleString('en-US');
                                    }
                                },
                            },
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
                        text: `Confirmed cases in ${utility.getCountry(country[0])}: ${objectData.populationC} (${objectData.confirmedOverPop}%)`,
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
    function generateBarChart(arr, change, topByMortality, topReverse) {
        let labels = [];
        let values = [];

        if (topByMortality)
            arr = utility.getMortality(arr, topReverse);

        // console.log(arr);

        for (let i = 0; i < topNumber; i++) {
            labels[i] = arr[0][i].country;
            values[i] = arr[0][i].biggestValue;
        }

        let str = (topByMortality) ? 'by mortality rate' : '';
        str += (change) ? '(by rate of change of the last day)' : '';

        const chartData = {
            backgroundColor: 'rgba(44,47,51, 1)',
            width: 1000,
            height: 500,
            chart: {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: (topByMortality) ? 'Mortality rate' : 'Confirmed cases',
                        backgroundColor: utility.getGraphColor((topByMortality) ? 'd' : 'c'),
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

    function generateGraphCombined(arr) {
        let labels = [];
        let active = [];
        let deaths = [];
        let recovered = [];
        let confirmed = [];

        for (let i = 0; i < arr.length; i++) {
            labels.push(arr[i].date);
            active.push(arr[i].active);
            deaths.push(arr[i].deaths);
            recovered.push(arr[i].recovered);
            confirmed.push(arr[i].confirmed);
        }

        let datasets = [{
            label: 'Active',
            backgroundColor: utility.getGraphColor('c'),
            borderColor: utility.getGraphColor('c'),
            data: active,
            fill: false,
        }, {
            label: 'Recovered',
            backgroundColor: utility.getGraphColor('r'),
            borderColor: utility.getGraphColor('r'),
            data: recovered,
            fill: false,
        }, {
            label: 'Deaths',
            backgroundColor: utility.getGraphColor('d'),
            borderColor: utility.getGraphColor('d'),
            data: deaths,
            fill: false,
        }];

        if (combinedConfirmed)
            datasets.unshift({
                label: 'Confirmed',
                backgroundColor: utility.getGraphColor2('c'),
                borderColor: utility.getGraphColor2('c'),
                data: confirmed,
                fill: false,
            });

        const chartData = {
            backgroundColor: 'rgba(44,47,51, 1)',
            width: 1000,
            height: 500,
            chart: {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets,
                },
                options: {
                    title: {
                        display: true,
                        text: utility.getCountry(country[0]),
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
        const canvasRenderService = new CanvasRenderService(
            chartData.width,
            chartData.height,
            (ChartJS) => {
                ChartJS.plugins.register({
                    beforeDraw: chart => {
                        const ctx = chart.ctx;
                        ctx.fillStyle = chartData.backgroundColor;
                        ctx.fillRect(0, 0, chartData.width, chartData.height);
                    },
                });
            });

        canvasRenderService.renderToBuffer(
            chartData.chart,
            'image/png',
        ).then(buffer => {
            fs.writeFileSync('1.png', buffer);
            if (message)
                message.channel.send({ files: ['1.png'] }).then(message.channel.stopTyping());
            else
                cv_cmd.openImage();
        });
    }
}
