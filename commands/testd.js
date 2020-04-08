const recovered = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';
const confirmed = 'http://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
const deaths = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    name: 'testd',
    description: 'Testing downloading the csv file',
    show: false,
    execute(message, args) {

        async function download() {
            const url = confirmed;
            const imagepath = path.resolve(__dirname, 'downloads', 'output.csv');
            const writer = fs.createWriteStream(imagepath);
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

        function shouldRefreshFile(fileDate) {
            let today = new Date();

            if (fileDate.month < today.getMonth() || fileDate.day < today.getDay())
                return true;
            else return today.getHours() - fileDate.hour >= 6;

        }
        function getFileDate() {
            let result;

            fs.open('./commands/downloads/output.csv', 'r', (err, fd) => {
                if (err) throw err;
                fs.fstat(fd, (err, stat) => {
                    if (err) throw err;

                    let fileTime = {
                        month: stat.mtime.getMonth(),
                        day: stat.mtime.getDay(),
                        hour: stat.mtime.getHours(),
                    };

                    shouldRefreshFile(fileTime);

                    fs.close(fd, (err) => {
                        if (err) throw err;
                    });
                });
            });
            return result;
        }
        // download();
        // getFileDate();
    },
};
