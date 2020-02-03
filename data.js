// data.js - contains functions related to importing iris data and pre-processing.

/**
 * loadData - imports iris data.
 *
 * @param  {String} url File destination for iris dataset.
 * @param  {String[]} indicies Array of class names.
 */
async function loadData(url, indicies){
    return d3.csv(url, d => {
        return {
            sepal_length: +d.sepal_length,
            sepal_width: +d.sepal_width,
            petal_length: +d.petal_length,
            petal_width: +d.petal_width,
            class: oh(indicies, d.class) // encode class labels in one hot
        }
    });
}



/**
 * oh - one hot encoding for a value.
 *
 * @param  {String[]} indicies Array of classes.
 * @param  {String} value Value to be represented in one hot encoding.
 * @return {int[]} One hot encoding
 */
function oh(indicies, value){
    let a = [0, 0, 0];
    a[indicies.indexOf(value)] = 1;
    return a;
}



/**
 * l2 - returns l2/euclidean norm for a given vector. Used to scale vectors
 * for model training.
 *
 * @param  {float[]} v Vector.
 * @return {float} l2 norm.
 */
function l2(v) {
    // l2 norm = sqrt of sum of squared values
    return Math.sqrt( v.map(n => Math.pow(n, 2)).reduce((a, b) => a + b) );
}



/**
 * shuffle - Shuffles an array using fisher-yates algorithm. Borrowed from:
 * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 *
 * @param  {Array} a Array to be shuffled.
 * @return {Array}   Shuffled Array.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
