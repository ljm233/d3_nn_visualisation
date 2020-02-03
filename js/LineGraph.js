// LineGraph.js - contains LineGraph class.
// adapted from: https://www.d3-graph-gallery.com/graph/connectedscatter_basic.html


/**
 * Class to handle the creation and update of a line graph.
 */
class LineGraph {

    xMax = 0;
    yMax = 0;

    data; // array of object arrays top hold path points for each series.
    constructor(id, allGroup, widthPcnt, heightPcnt, margin, title) {

        // height and width of container div according to percentage of viewport
        this.height = $(document).height() * heightPcnt - margin.top - margin.bottom;
        this.width = $(document).width() * widthPcnt - margin.left - margin.right;


        // colour scale, for colouring each series differently
        this.colour = d3.scaleOrdinal()
            .domain(allGroup)
            .range(d3.schemeSet2);


        // insert svg and create group to contain the graph
        this.svg = d3.select(id).append('svg')
                .attr('id', title)
                .attr("width", this.width + margin.left + margin.right)
                .attr("height", this.height + margin.top + margin.bottom)
            .append("g")
                .attr('transform', `translate(${margin.left}, ${margin.top})`);


        // write title for graph
        var fs = 14
        d3.select('#'+title).append('text')
            .text(title + ':')
            .attr('font-size', fs)
            .attr('transform', `translate(${margin.left}, ${margin.top - fs})`);


        // set initial axis
        // x
        this.x = d3.scaleLinear()
            .domain([0, this.xMax])
            .range([ 0, this.width ]);
        this.xAxis = d3.axisBottom(this.x);
        this.gx = this.svg.append('g')
            .attr("transform", "translate(0," + this.height + ")") // render x axis at bottom of graph
            .call(this.xAxis);

        // y
        this.y = d3.scaleLinear()
            .domain([0, this.yMax])
            .range([this.height, 0]);
        this.yAxis = d3.axisLeft(this.y);
        this.gy = this.svg.append('g')
            .call(this.yAxis);


        // line generator, used later to create paths(connected line plots) on graph.
        this.line = d3.line()
            .x( d => {return this.x(+d.x)} )
            .y( d => {return this.y(+d.y)} )


        // initialise data structure for storing points on each path
        this.data = allGroup.map(g => { // one object per series
            return {
                name: g, // name of series
                values: [] // array to hold points in series
            }
        });


        // insert path elements now, to be updated with data later
        this.gl = this.svg.append('g');
        this.gl.selectAll('path')
            .data(this.data)
            .enter()
            .append('path')
                .attr('stroke', d => {return this.colour(d.name)})
                .style('stroke-width', 2)
                .style('fill', 'none');


        // create a legend
        fs = 10; // assign new value to fs
        var legend = this.svg.append('g') // create group for legend
            .attr('transform', 'translate(' + (margin.left + 10) + ', 0)')
            .selectAll('g')
            .data(this.data)
            .enter() // enter groups for each item in legend
                .append('g')
                .attr('transform', (_, i) => { return `translate(0, ${i * fs + 10})` }) // position each legend underneith the last. (+10 to space them out)

        const r = fs / 2 - 2; // calc radius so that diameter just smaller than text
        legend.append('circle')
            .attr('r', r)
            .style('fill', d => { return this.colour(d.name) })
        legend.append('text')
            .attr('transform', `translate(${fs}, 0)`)
            .attr('font-size', fs)
            .text(d => { return d.name })
            .style('fill', d => { return this.colour(d.name) })
    }


    /**
     * addData - Updates class data with new points to be plotted.
     *
     * @param  {object[]} points array of point objects [{x, y}, ...]. One point object for each series, in the same order as allGroup.
     */
    addData(points) {
        points.forEach( (point, i) => {
            // check for new maximum values, used to update axis
            this.xMax = (point.x > this.xMax) ? point.x : this.xMax;
            this.yMax = (point.y > this.yMax) ? point.y : Math.ceil(this.yMax * 10) / 10; // round yMax to nearest 0.1 -> keeps y axis values neat

            // append point to data
            this.data[i].values.push(point);
        });
    }


    /**
     * draw - Draws a line graph using current class data.
     */
    draw() {
        // redraw axis with new maximums
        this.x
            .domain([0, this.xMax])
            .range([0, this.width]);
        this.gx
            .attr('transform', `translate(0, ${this.height})`)
            .transition().duration(200)
            .call(this.xAxis);

        this.y
            .domain([0, this.yMax])
            .range([this.height, 0]);
        this.gy
            .transition().duration(200)
            .call(this.yAxis)

        // redraw lines
        this.gl.selectAll('path')
            .transition().duration(200)
            .ease(d3.easeLinear)
            .attr('d', d => { return this.line(d.values) });

    }
}
