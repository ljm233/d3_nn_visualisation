// ModelGraph.js - Contains ModelGraph class.

/**
 * Class to handle the creation and update of a neural network visualisation,
 * based off a tf.sequential model.
 */
class ModelGraph {
    // vars to store model data
    weights;
    biases;
    // vars to store model data in flattened form
    weightsFlat;
    biasesFlat;

    colour; // colour interpolate function
    model; // tensorflow model to be visualised

    // vars to store groups in svg
    edges;
    nodes;

    constructor(model) {
        this.drawModel(model);
    }

    drawModel(model) {
        this.model = model;

        // constants
        const widthPcnt = .6;
        const heightPcnt = 1;
        const id = '#nnDiv';

        // extract data from model to build the initial graph
        this.updateData();



        // ### draw an initial model svg ###

        // inst svg and insert group as graph container
        const margin = {left:20, right:20, top:20, bottom:20};
        const width = $(document).width() * widthPcnt - margin.left - margin.right;
        const height = $(document).height() * heightPcnt - margin.top - margin.bottom;
        let graph = d3.select(id).append('svg')
            .attr('height', height + margin.top + margin.bottom)
            .attr('width', width + margin.left + margin.right)
            .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`)

        // x axis interpolator
        const xMax = model.layers.length;
        let x = d3.scaleLinear()
            .domain([0, xMax])
            .range([0, width]);

        // array of y axis interpolators, for each layer
        let ys = this.biases.map( b => {
            return d3.scaleLinear()
                .domain([0, b.length+1]) // for each layer,
                .range([0, height]); // height in 2nd column ensures y values are calc'd from top down
        });

        // colour interpolator
        this.colour = d3.interpolate('blue', 'red');

        // add edges to svg
        graph.append('g').selectAll('g')
            .data(this.weights)
            .enter() // enter group for each layer
            .append('g').selectAll('g')
                .data((d, i) => d.map((vector, j) => { return {vec: vector, layer:i, from:j} } ))
                .enter() // enter group for each node in layer
                .append('g').selectAll('line')
                    .data( d => d.vec.map( node => { return {layer:d.layer, from:d.from} } ))
                    .enter() // enter line for each edge from node
                    .append('line')
                        .attr('x1', d => x(d.layer))
                        .attr('y1', d => ys[d.layer](d.from+1))
                        .attr('x2', d => x(d.layer+1))
                        .attr('y2', (d, k) => ys[d.layer+1](k+1))
                        .style('stroke-width', 2)

        // add nodes to svg
        graph.append('g').selectAll('g')
            .data(this.biases)
            .enter() // enter group for each layer
            .append('g').selectAll('circle')
                .data((d, i) => d.map( b => {return {bias: b, layer:i}})) // pair each value  its layer
                .enter()
                .append('circle')
                    .attr('cx', d => x(d.layer)) // x(i)
                    .attr('cy', (d, j) => ys[d.layer](j+1) ) // y[i](j): scale j for using linear scale for current layer i.
                    .attr('r', 10)
                    .style('stroke-width', 2)
                    .style('fill', 'white')

        // store selections for the edges and nodes that have been created
        this.edges = graph.selectAll('line');
        this.nodes = graph.selectAll('circle');

        // update model with colours
        this.flattenData(); // data must be flattened before updateModel() can colour the graph
        this.updateModel();
    }

    updateData() {
        // grab latest data from model
        this.weights = [];
        this.biases = [];
        const inputSize = this.model.layers[0].input.shape[1];
        this.biases.push(new Array(inputSize).fill(0)); // insert input layer as array of zeroes
        this.model.layers.forEach( l => { // iterate through layers in model
            const values = l.getWeights(); // extract data from layer
            this.weights.push(values[0].arraySync());
            this.biases.push(values[1].arraySync());// to be flattened.
        });
    }

    flattenData() {
        // flatten weights and bias data
        this.weightsFlat = this.weights.reduce((prev, curr) => prev.concat(curr));
        this.weightsFlat = this.weightsFlat.reduce((prev, curr) => prev.concat(curr)); // edges need to be flattened twice (since is 3d array)
        this.biasesFlat = this.biases.reduce((prev, curr) => prev.concat(curr));
    }

    updateModel() {
        // d3 transition rules
        this.edges
            .data(this.weightsFlat)
            .transition()
            .duration(200)
            .style('stroke', d => this.colourInt(d));

        this.nodes
            .data(this.biasesFlat)
            .transition()
            .duration(200)
            .style('stroke', d => this.colour(d));
    }

    transitionColours() {
        this.updateData();
        this.flattenData();
        this.updateModel();
    }

    colourInt(x) {
        return this.colour((x + 1) / 2) // scale values to between 0 and 1, from -1 to 1
    }

}
