module.exports = {getChange, replaceKnownCountry, getGraphLabel, getGraphColor, formatForGraph, filterCasesDecreasing,
    filterCasesDupes, filterCasesEmpty, includesCountry, sumRows, getRowData, getPopulation, populationData, getGraphPieCountry,
    replaceKnownCountryPie, removeMaliciousChars};

/**
 * Returns difference per array index
 * @param arr
 * @returns {[*]}
 */
function getChange(arr) {
    const finalArray = [arr[0]];

    for (let i = 1; i < arr.length; i++) {
        finalArray.push(arr[i] - arr[i - 1]);
    }
    return finalArray;
}

/**
 * Replaces some countries so they are found in the csv file
 * @param knownCountry
 * @returns {string|*}
 */
function replaceKnownCountry(country) {
    for (let i in country) {
        if (country[i].toLowerCase() === 'vatican')
            country[i] = 'holy see';
        else if (country[i].toLowerCase() === 'usa')
            country[i] = 'US';
        else if (country[i].toLowerCase() === 'uk')
            country[i] = 'united kingdom';
        else if (country[i].toLowerCase() === 'south korea')
            country[i] = 'korea';
    }
    return country;
}

/**
 * Generates label to be used in the line chart
 * @param country
 * @param flag
 * @returns {string}
 */
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
}

/**
 * Returns appropriate color based on the flag
 * @param flag
 * @returns {string}
 */
function getGraphColor(flag) {
    if (flag === 'r') {
        return 'rgba(0, 200, 83, 1)';
    } else if (flag === 'd') {
        return 'rgba(235, 40, 40, 1)';
    } else {
        return 'rgba(41, 121, 255, 1)';
    }
}

/**
 * Changes date format so its recognised by chart.js
 * @param arr
 * @returns {[]}
 */
function formatForGraph(arr) {
    const arrFinal = [[]];
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            const temp = arr[i][j].date.split('/');
            arrFinal[i].push({
                date: `${temp[2]}-${temp[0]}-${temp[1]}`,
                value: arr[i][j].value,
            });
        }
    }

    return arrFinal;
}

/**
 * Filters out indexes where the number of cases decreased (thats impossible, its an error in the csv file)
 * @param arr
 * @returns {[]}
 */
function filterCasesDecreasing(arr) {
    const finalArray = [[]];

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (j === 0) {
                finalArray[i].push(arr[i][j]);
            } else if (arr[i][j].value >= arr[i][j - 1].value) {
                finalArray[i].push(arr[i][j]);
            }
        }
    }

    return finalArray;
}

/**
 * Filters out duplicates
 * @param arr
 * @returns {[]}
 */
function filterCasesDupes(arr) {
    const finalArray = [[]];

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (j === 0) {
                finalArray[i].push(arr[i][j]);
            } else if (arr[i][j].value !== arr[i][j - 1].value) {
                finalArray[i].push(arr[i][j]);
            }
        }
    }

    return finalArray;
}

/**
 * Filters out empty cases (0)
 * @param arr
 * @returns {[]}
 */
function filterCasesEmpty(arr) {
    const finalArray = [[]];

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j].value !== 0) {
                finalArray[i].push(arr[i][j]);
            }
        }
    }

    return finalArray;
}

/**
 * Returns whether the passed row contain the passed country
 * @param arr
 * @param index
 * @param country
 * @returns {RegExpMatchArray}
 */
function includesCountry(arr, index, country) {
    let check = '';
    if (arr[index][0]) {
        check += arr[index][0].toLowerCase() + ' ';
    }
    if (arr[index][1]) {
        check += arr[index][1].toLowerCase() + ' ';
    }

    return check.match(`\\b${country.toLowerCase()}\\b`);
}

/**
 * Sums 2 rows (arrays)
 * @param row1
 * @param row2
 * @returns {*}
 */
function sumRows(row1, row2) {
    for (let i = 0; i < row1.length; i++) {
        row1[i].value += row2[i].value;
    }
    return row1;
}

/**
 * Returns an array of data (one country row)
 * @param arr
 * @param index
 * @returns {[]}
 */
function getRowData(arr, index) {
    const finalArray = [];

    for (let i = 4; i < arr[0].length; i++) { // Dates start from index 4
        finalArray.push({
            date: arr[0][i],
            value: parseInt(arr[index][i], 10),
        });
    }
    return finalArray;
}

/**
 * Returns the population of the passed country
 * @param country
 * @param population
 * @returns {number}
 */
function getPopulation(country, population) {
    let num = 0;

    if (country === 'us') {
        return 329470573;
    }

    // The numbers for all and other were calculated using the json file, hardcoded to save time.
    if (country === 'all')
        num = 7444509223;
    else if (country === 'other')
        num = 6034991826;
    else {
        for (const i in population) {
            if (population[i].country.toLowerCase().match(`\\b${country.toLowerCase()}\\b`) && population[i].population) {
                num += parseInt(population[i].population, 10);
            }
        }
    }
    return num;
}

/**
 * Returns statistics for pie chart
 * @param populationC_unchecked
 * @param populationD_unchecked
 * @param populationR_unchecked
 * @param pop
 * @returns {{recoveredOverConfirmed: string, confirmedOverPop: string, deadOverConfirmed: string, activeOverConfirmed: string, populationC: *, activeCases: number}}
 */
function populationData(populationC_unchecked, populationD_unchecked, populationR_unchecked, pop) {
    let populationC, populationD, populationR;

    if (populationC_unchecked)
        populationC = populationC_unchecked.value;
    else
        populationC = 0;

    if (populationD_unchecked)
        populationD = populationD_unchecked.value;
    else
        populationD = 0;

    if (populationR_unchecked)
        populationR = populationR_unchecked.value;
    else
        populationR = 0;

    const confirmedOverPop = (100 * populationC / pop).toFixed(2);
    const recoveredOverConfirmed = (100 * populationR / populationC).toFixed(2);
    const deadOverConfirmed = (100 * populationD / populationC).toFixed(2);
    const activeCases = populationC - populationD - populationR;
    const activeOverConfirmed = (100 * activeCases / populationC).toFixed(2);

    return {
        populationC: populationC,
        confirmedOverPop: confirmedOverPop, // Percentage of the population that has been infected
        recoveredOverConfirmed: recoveredOverConfirmed, // Percentage of the infected that has recovered
        deadOverConfirmed: deadOverConfirmed, // Percentage of the infected that has died
        activeOverConfirmed: activeOverConfirmed, // Percentage of total confirmed cases that is still active
        activeCases: activeCases, // Active cases
    };
}

/**
 * Used in the pie chart label
 * @param country
 * @returns {string}
 */
function getGraphPieCountry(country) {
    if (country === 'all')
        return 'all countries';
    else if (country === 'other')
        return 'all countries except China';
    else
        return country.charAt(0).toUpperCase() + country.slice(1);
}

/**
 * Replaces some countries to match the ones in population.json
 * @param country
 * @returns {string|*}
 */
function replaceKnownCountryPie(country) {
    if (country.toLowerCase() === 'vatican')
        return 'Vatican City State';
    else if (country.toLowerCase() === 'korea' || country.toLowerCase() === 'south korea')
        return 'South Korea';
    else if (country.toLowerCase() === 'usa')
        return 'us';
    else
        return country;
}

/**
 * Removes malicious characters that can be used to crash the program from country
 * @param country
 * @returns {*}
 */
function removeMaliciousChars(country) {
    let maliciousChars = '[](){}<>-\\/|?!;^$.&*+';

    for (let i in country)
        for (let j in maliciousChars)
            if (country[i].includes(maliciousChars[j]))
                country[i] = country[i].split(maliciousChars[j]).join('');

    return country;
}
