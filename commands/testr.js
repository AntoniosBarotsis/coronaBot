const PolynomialRegression = require('ml-regression-polynomial');

module.exports = {
    name: 'testr',
    description: 'Testing stuff',
    usage: '``.testr``',
    show: false,
    execute(message, args, client) {
    // import ExponentialRegression from 'ml-regression-exponential';

        /*
        A/(B+e^(C t))
        a+bx + c(x^2)/2 + d(x^3)/6
         */
        const valuesY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 20, 62, 155, 229, 322, 453, 655, 888, 1128, 1694, 2036,
            2502, 3089, 3858, 4636, 5883, 7375, 9172, 10149, 12462, 12462, 17660, 21157, 24747, 27980, 31506, 35713, 41035, 47021, 53578, 59138, 63927, 69176, 74386,
            80589, 86498, 92472, 97689, 101739, 105792, 110574, 115242, 119827];

        const valuesX = [];
        for (let i = 0; i < valuesY.length; i++) { valuesX.push(i); }

        const degree = 5;

        const regression = new PolynomialRegression(valuesX, valuesY, degree);

        // message.channel.send(`Last known value\n**Guess: ${Math.round(regression._predict(valuesY.length - 1))}**\n
        // **Real: ${valuesY[valuesY.length - 1]}**`);
        //
        // message.channel.send(`Untrained value\n**Guess: ${Math.round(regression._predict(valuesY.length))}**\n
        // **Real: ${Math.round(regression._predict(valuesY.length))}**`);


        let str = '';
        for (let i = 0; i < valuesY.length; i++) {
            let guess = Math.round(regression._predict(i));
            let finalGuess = guess > 0 ? guess : 0;
            str += valuesY[i] - finalGuess + '\n';
        }

        message.channel.send(str);

        // Math.round(regression._predict(valuesY.length))
    },
};
