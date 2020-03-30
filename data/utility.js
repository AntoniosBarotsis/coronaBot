module.exports = {
    getChange:
        function getChange(arr) {
            const finalArray = [arr[0]];

            for (let i = 1; i < arr.length; i++) {
                finalArray.push(arr[i] - arr[i - 1]);
            }
            return finalArray;
        },

    replaceKnownCountry:
        function replaceKnownCountry(knownCountry) {
            if (knownCountry.toLowerCase() === 'vatican') {
                return 'holy see';
            } else if (knownCountry.toLowerCase() === 'usa') {
                return 'US';
            } else if (knownCountry.toLowerCase() === 'uk') {
                return 'united kingdom';
            } else if (knownCountry.toLowerCase() === 'south korea') {
                return 'korea';
            } else {
                return knownCountry;
            }
        },

    getGraphLabel:
        function getGraphLabel(country, flag) {
            let actualCountry = country.charAt(0).toUpperCase() + country.slice(1);

            if (country === 'all') {
                actualCountry = 'all countries';
            } else if (country === 'other') {
                actualCountry = 'all countries except China';
            }

            if (flag === 'r') {
                return `Recovered cases in ${actualCountry}`;
            } else if (flag === 'd') {
                return `Deaths in ${actualCountry}`;
            } else {
                return `Confirmed cases in ${actualCountry}`;
            }
        },

    getGraphColor:
        function getGraphColor(flag) {
            if (flag === 'r') {
                return 'rgba(0, 200, 83, 1)';
            } else if (flag === 'd') {
                return 'rgba(235, 40, 40, 1)';
            } else {
                return 'rgba(41, 121, 255, 1)';
            }
        },

    formatForGraph:
        function formatForGraph(arr) {
            const arrFinal = [];

            for (let i = 0; i < arr.length; i++) {
                const temp = arr[i].date.split('/');
                arrFinal.push({
                    date: `${temp[2]}-${temp[0]}-${temp[1]}`,
                    value: arr[i].value,
                });
            }
            return arrFinal;
        },

    filterCasesDecreasing:
        function filterCasesDecreasing(arr) {
            const finalArray = [];

            for (let i = 0; i < arr.length; i++) {
                if (i === 0) {
                    finalArray.push(arr[i]);
                } else if (arr[i].value >= arr[i - 1].value) {
                    finalArray.push(arr[i]);
                }
            }

            return finalArray;
        },

    filterCasesDupes:
        function filterCasesDupes(arr) {
            const finalArray = [];

            for (let i = 0; i < arr.length; i++) {
                if (i === 0) {
                    finalArray.push(arr[i]);
                } else if (arr[i].value !== arr[i - 1].value) {
                    finalArray.push(arr[i]);
                }
            }

            return finalArray;
        },

    filterCasesEmpty:
        function filterCasesEmpty(arr) {
            const finalArray = [];

            for (let i = 0; i < arr.length; i++) {
                if (arr[i].value !== 0) {
                    finalArray.push(arr[i]);
                }
            }

            return finalArray;
        },

    includesCountry:
        function includesCountry(arr, index, country) {
            let check = '';
            if (arr[index][0]) {
                check += arr[index][0].toLowerCase() + ' ';
            }
            if (arr[index][1]) {
                check += arr[index][1].toLowerCase() + ' ';
            }

            return check.match(`\\b${country.toLowerCase()}\\b`);
        },

    sumRows:
        function sumRows(row1, row2) {
            for (let i = 0; i < row1.length; i++) {
                row1[i].value += row2[i].value;
            }
            return row1;
        },


    getRowData:
        function getRowData(arr, index) {
            const finalArray = [];

            for (let i = 4; i < arr[0].length; i++) { // Dates start from index 4
                finalArray.push({
                    date: arr[0][i],
                    value: parseInt(arr[index][i], 10),
                });
            }
            return finalArray;
        },

    getPopulation:
        function getPopulation(country, population) {
            let num = 0;
            for (const i in population) {
                if (population[i].country.toLowerCase() === 'greece') {
                    num = population[i].population;
                }
            }
            return num;
        },
};
