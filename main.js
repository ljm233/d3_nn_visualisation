// funs.js - contains general functions to run this project.

/**
 * run - main path of execution
 */
async function run() {
    const url = '/data/iris.data'; // data file
    const indicies = ['Iris-setosa', 'Iris-versicolor', 'Iris-virginica']; // class names

    // load data
    let data = await loadData(url, indicies);

    // split data into x's and y's
    var xs = data.map(d => [d.sepal_length, d.sepal_width, d.petal_length, d.petal_width]);
    var ys = data.map(d => d.class)

    // normalise x's
    xs = xs.map(vec => { // for each example vector:
        const norm = l2(vec); // calc l2 norm
        return vec.map(elem => elem / norm) // normalise each elem in vector
    });

    // to shuffle dataset: zip xs and ys, shuffle, then unzip.
    var z = xs.map( (e, i) => [e, ys[i]] ); // zip
    z = shuffle(z);
    z = z[0].map((col, i) => z.map(row => row[i])); // transpose shuffled array to unzip
    [xs, ys] = [z[0], z[1]]; // unpack

    // instantiate model
    let model = getModel();

    // instantiate neural net graph visualisation
    const MG = new ModelGraph(model)

    // instantiate graphs for plotting accuracy and loss
    const margin = {top: 50, right: 20, bottom: 30, left: 50};
    const width = .4;
    const height = .45;
    let LG = new LineGraph('#lossGraph', ['test', 'train'], width, height, margin, 'Loss');
    let AG = new LineGraph('#accGraph', ['test', 'train'], width, height, margin, 'Accuracy');

    // train model
    const epochs = 30;
    await trainModel(model, tf.tensor(xs), tf.tensor(ys), modelCb(MG, LG, AG), epochs);
}



/**
 * modelCb - model training callback. Uses training stats at the end of each
 * epoch to update on screen graphs and visualisations during training.
 *
 * @param  {ModelGraph} modelGraph ModelGraph object representing the model to be trained.
 * @param  {Graph} lossGraph Graph object representing the loss graph.
 * @param  {Graph} accGraph  Graph object representing the accuracy graph.
 * @return {function} callback function.
 */
function modelCb(modelGraph, lossGraph, accGraph) {
    return {
        onEpochEnd: (epoch, logs) => {
            //console.log('epoch: ', epoch);
            //console.log('logs: ', logs);

            // update node and edge colours in model graph
            modelGraph.transitionColours();

            // update accuracy, loss, and epoch metrics
            $('#epoch_disp').text(epoch + 1);
            $('#acc_disp').text(Number.parseFloat(logs.val_acc).toFixed(2));
            $('#loss_disp').text(Number.parseFloat(logs.val_loss).toFixed(2));

            // append latest loss values and update graph
            const l = [
                {x: epoch, y:logs.val_loss},
                {x: epoch, y:logs.loss}
            ]
            lossGraph.addData(l);
            lossGraph.draw();

            // append latest accuracy values and update graph
            const a = [
                {x: epoch, y:logs.val_acc},
                {x:epoch, y:logs.acc}
            ]
            accGraph.addData(a);
            accGraph.draw();
        }
    }
}
