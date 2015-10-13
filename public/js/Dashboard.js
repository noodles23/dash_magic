queue()
    .defer(d3.json, "/api/data")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
	
//Start Transformations
	var dataSet = apiData;
	var dateFormat = d3.time.format("%m/%d/%Y");
	dataSet.forEach(function(d) {
		d.transaction_date = dateFormat.parse(d.transaction_date);
				// d.transaction_date.setDate(1);
		d.sales_price = +d.sales_price;
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	var all = ndx.groupAll();	
	var datePosted = ndx.dimension(function(d) { return d.transaction_date; });
	var prodCategory = ndx.dimension(function(d) { return d.prod_catagory; });

	var salespriceByDate=datePosted.group().reduceSum(dc.pluck('sales_price'));
	var salespriceByCat=prodCategory.group().reduceSum(dc.pluck('sales_price'));

	// var gradeLevel = ndx.dimension(function(d) { return d.prod_category; });
	// var salesPrice = ndx.dimension(function(d) { return d.sales_price; });


	//Calculate metrics
	// var projectsByDate = datePosted.group(); 
	// var projectsByGrade = gradeLevel.group(); 
	// var projectsBySalesPrice = salesPrice.group();

	// var all = ndx.groupAll();

	// //Calculate Groups
	// var totalDonationsState = gradeLevel.group().reduceSum(function(d) {return d.sales_price;});
	// var netTotalDonations = ndx.groupAll().reduceSum(function(d) {return d.sales_price;});

	//Define threshold values for data
	var minDate = datePosted.bottom(1)[0].transaction_date;
	var maxDate = datePosted.top(1)[0].transaction_date;

console.log(minDate);
console.log(maxDate);

    //Charts
	var dateChart = dc.lineChart("#date-chart");
	var resourceTypeChart = dc.rowChart("#resource-chart");
	// var resourceTypeChart = dc.dataTable("#resource-chart");


	dateChart
		//.width(600)
		.height(220)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(datePosted)
		// .group(projectsByDate)
		.group(salespriceByDate)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Month")
		.yAxis().ticks(6);

	resourceTypeChart
        //.width(300)
        .height(220)
        // .dimension(salesPrice)
        .dimension(prodCategory)
        .group(salespriceByCat)
        .elasticX(true)
        .xAxis().ticks(5);

    dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);

    dc.renderAll();

};