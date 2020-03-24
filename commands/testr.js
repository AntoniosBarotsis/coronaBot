const PolynomialRegression = require("ml-regression-polynomial");

module.exports = {
    name: 'testr',
    description: 'Testing stuff',
    usage: "``.testr``",
    execute(message, args, client) {

        // import ExponentialRegression from 'ml-regression-exponential';

        let valuesY = [0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,20,62,155,229,322,453,655,888,1128,1694,2036,
            2502,3089,3858,4636,5883,7375,9172,10149,12462,12462,17660,21157,24747,27980,31506,35713,41035];

        let valuesX = [];
        for (let i = 0; i < 58; i++)
            valuesX.push(i);

        const degree = 5;

        const regression = new PolynomialRegression(valuesX, valuesY, degree);


        message.channel.send(Math.round(regression._predict(58)));
        message.channel.send(Math.round(regression._predict(59)));
    },
};