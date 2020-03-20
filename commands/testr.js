const tf = require("@tensorflow/tfjs");

module.exports = {
    name: 'testr',
    description: 'Testing stuff',
    usage: "``.testr``",
    execute(message, args, client) {

        let x_vals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let x_vals2 = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
        let y_vals = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];

        let m, b;

        const learningRate = 0.01;
        const optimizer = tf.train.sgd(learningRate);

        m = tf.variable(tf.scalar(Math.random()));
        b = tf.variable(tf.scalar(Math.random()));

        function predict(x) {
            // Turn array into a tensor
            const xs = tf.tensor1d(x);
            return xs.mul(m).add(b);
        }

        function loss(pred, label) {
            // pred is the ys from the predict func, label is the actual y
            return pred.sub(label).square().mean();
        }

        function train() {
            if (x_vals.length > 0) {
                const ys = tf.tensor1d(y_vals);
                optimizer.minimize(() => loss(predict(x_vals), ys))
            }
        }


        // console.log(tf.tensor1d(y_vals).print());
        // predict(x_vals).print();

        tf.tidy(() => {
            for (let i = 0; i < 1000; i++) {
                let temp = [];
                train();
                predict(x_vals).dataSync().forEach(e => temp.push(Math.round(e)));
            }
        });

        let results2 = [];
        let results3 = [];
        tf.tidy(() => {
            predict(x_vals).dataSync().forEach(e => results2.push(Math.round(e)));
            predict(x_vals2).dataSync().forEach(e => results3.push(Math.round(e)));
        });

        let str = '';
        str +=`Given xs: ${x_vals.toString()}\n`;
        str +=`Given ys: ${y_vals.toString()}\n`;
        str += `Ys on same x input: ${results2.toString()}\n`;
        message.channel.send(str + `Ys on new x input: ${results3.toString()}\n` + `Uncleaned tensors: ${tf.memory().numTensors}`);

    },
};