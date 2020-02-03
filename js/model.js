// model.js - contains classes related to creating and fitting a tf.sequential model.

/**
 * getModel - defines and returns a tf.js sequential model object.
 *
 * @return {tf.Sequential}  Model object.
 */
function getModel() {
    // model params
    const model = tf.sequential();
    const activ = 'relu';
    const opti = tf.train.adam(0.01);
    const loss = 'categoricalCrossentropy';

    // TODO: perhaps allow for more different types of layers to be used in visualisation
    // define layers
    model.add(tf.layers.dense({units: 7, activation:activ, inputShape: [4]}));
    model.add(tf.layers.dense({units: 7, activation:activ}));
    model.add(tf.layers.dense({units: 3, activation: 'softmax'}));

    // compile
    model.compile({optimizer:opti, loss:loss, metrics:['accuracy']});

    return model;
}


/**
 * trainModel - Trains a tf.js model on a given dataset.
 *
 * @param  {ts.Model} model  Model to be trained.
 * @param  {float[][]} xs Input vectors.
 * @param  {float[][]} ys Output vectors.
 * @param  {function} fcb Training callback.
 * @param  {int} epochs Epochs to fit data to model.
 */
async function trainModel(model, xs, ys, fcb, epochs) {
    const BATCH_SIZE = 25;
    const TRAIN_TEST_SPLIT = 0.2;

    return model.fit(xs, ys, {
        batchSize: BATCH_SIZE,
        validationSplit: TRAIN_TEST_SPLIT,
        epochs: epochs,
        callbacks: fcb
    });
}
