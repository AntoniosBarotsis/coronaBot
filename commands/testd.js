const recovered = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';
const confirmed = 'http://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
const deaths = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const utility = require('./../data/utility');

module.exports = {
    name: 'testd',
    description: 'Testing downloading the csv file',
    show: false,
    execute(message, args) {


        let confirmedFile = './commands/downloads/confirmed.csv';
        // let recoveredFile = './commands/downloads/recovered.csv';
        // let deathsFile = './commands/downloads/deaths.csv';

        async function download(url, str) {
            const filePath = path.resolve(__dirname, 'downloads', `${str}.csv`);
            const writer = fs.createWriteStream(filePath);
            const response = await axios({
                url: url,
                method: 'GET',
                responseType: 'stream',
            });

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        }

        let downloads = [download(confirmed, 'confirmed'), download(recovered, 'recovered'), download(deaths, 'deaths')];

        if (utility.shouldRefreshFile(utility.getFileDate('./commands/downloads/confirmed.csv'))) {
            downloads.unshift(download(confirmed, 'confirmed'));
            downloads.unshift(download(deaths, 'deaths'));
            downloads.unshift(download(recovered, 'recovered'));
            console.log('Downloaded files');
        }

        Promise.all(downloads).then(() => {
            let confirmedInitArray = fs.readFileSync(confirmedFile, 'UTF-8').split('\n');
            // let recoveredInitArray = fs.readFileSync(recoveredFile, 'UTF-8').split('\n');
            // let deathsInitArray = fs.readFileSync(deathsFile, 'UTF-8').split('\n');
            console.log(confirmedInitArray[1].split(','));
        });


        //
        // utility.getFileDate('./commands/downloads/output.csv').then(value => {
        //     console.log(value);
        // });


        // getFileDate();
    },
};
