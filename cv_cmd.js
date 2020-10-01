module.exports = { openImage };

const exec = require('child_process').exec;
const main = require('./main.js');

/**
 * Opens the image
 */

function openImage() {
    if (process.platform === 'win32') {
        exec('1.png');
    } else if (process.platform === 'linux') {
        exec('xdg-open 1.png');
    } else if (process.platform === 'darwin') {
        exec('open 1.png');
    } else if (process.platform === 'android') {
        exec('xdg-open 1.png');
    }
}

let args = process.argv.slice(2);

main.cv(args, null);
