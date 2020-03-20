const tf = require("@tensorflow/tfjs");

module.exports = {
    name: 'test',
    description: 'Testing stuff',
    usage: "``.test``",
    execute(message, args, client) {

        let x_vals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let x_vals2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
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
        let results1 = [];
        predict(x_vals).dataSync().forEach(e => results1.push(Math.round(e)));
        // predict(x_vals).print();

        console.log(`Before training (random numbers almost): ${results1.toString()}`);

        for (let i = 0; i < 10; i++) {
            let temp = [];
            train();
            predict(x_vals).dataSync().forEach(e => temp.push(Math.round(e)));
            console.log(`During Training [${i}]: ${temp.toString()}`)
        }

        let results2 = [];
        let results3 = [];
        predict(x_vals).dataSync().forEach(e => results2.push(Math.round(e)));
        predict(x_vals2).dataSync().forEach(e => results3.push(Math.round(e)));
        // predict(x_vals).print();

        console.log(`Before training (random numbers almost): ${results1.toString()}`);
        console.log(`After training: ${results2.toString()}`);
        console.log(`Actual ys: ${y_vals.toString()}`);
        console.log(`After training 2: ${results3.toString()}`);
    },
};