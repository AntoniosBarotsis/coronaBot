const prefix = process.env.prefix;
const main = require('./../main');

module.exports = {
    name: 'cv',
    description: 'Displays number of confirmed/deaths/recovered cases of covid-19 on specific countries.',
    usage: '``' + prefix + 'cv [c/r/d](optional) [country/all/other] [pie/change/compare]``\n' +
        ' - If the first argument is left out, c is being selected by default.\n' +
        ' - All: Returns data on all countries\n' +
        ' - Other: Returns data on all countries except China\n' +
        ' - pie: Returns a pie chart (this is always c)\n' +
        ' - change: Returns a line chart showing the rate of change or the corresponding modifier\n' +
        ' - compare: allows you to query 2 countries. Example: ``.cv r greece compare romania``\n' +
        ' - log: plots logarithmic graphs instead\n' +
        ' - combined (c): plots a line chart with recovered, deaths and active cases. If you include `` c``,' +
        'confirmed cases are included in the graph as well\n',
    show: true,
    execute: function(message, args) {
        main.cv(args, message);
    },
};
