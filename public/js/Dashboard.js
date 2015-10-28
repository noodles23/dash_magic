queue()
    .defer(d3.json, "/api/data")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
	
//Start Transformations
	var dataSet = apiData;
	// var dateFormat = d3.time.format("%m/%d/%Y");
	dataSet.forEach(function(d) {
		// d.week = dateFormat.parse(d.week);
				// d.transaction_date.setDate(1);
		d.week= +d.week;
		d.sales_price = +d.sales_price;
		d.sales_count = +d.sales_count;
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	var all = ndx.groupAll();	
	var weekNum = ndx.dimension(function(d) { return d.week; });
	var prodCategory = ndx.dimension(function(d) { return d.prod_category; });
	var genderStatus = ndx.dimension(function(d) { return d.gender; });
	var custSource = ndx.dimension(function(d) { return d.customer_source; });
	var custStatus = ndx.dimension(function(d) { return d.cust_new_or_return; });
	var custState = ndx.dimension(function(d) { return d.customer_state; });

	var stateGroup = custState.group();
	var salespriceByWeek=weekNum.group().reduceSum(dc.pluck('sales_price'));
	var salespriceByCat=prodCategory.group().reduceSum(dc.pluck('sales_price'));
	var salespriceByGender=genderStatus.group().reduceSum(dc.pluck('sales_price'));
	var salespriceByCustSource=custSource.group().reduceSum(dc.pluck('sales_price'));

	var salescountByState=custState.group().reduceSum(dc.pluck('sales_count'));

	var netTotalSales = ndx.groupAll().reduceSum(dc.pluck('sales_price'));
	var netTotalOrders = ndx.groupAll().reduceSum(dc.pluck('sales_count'));

	var custNew=weekNum.group().reduceSum(function(d) 
   {if (d.cust_new_or_return==='new') {return d.sales_count;}else{return 0;}});
	var custReturn=weekNum.group().reduceSum(function(d) 
   {if (d.cust_new_or_return==='return') {return d.sales_count;}else{return 0;}});


	//Define threshold values for data
	var minDate = weekNum.bottom(1)[0].week;
	var maxDate = weekNum.top(1)[0].week;

console.log(minDate);
console.log(maxDate);

    //Charts
    var netOrders = dc.numberDisplay("#total-orders");
	var netSales = dc.numberDisplay("#total-sales");
	var dateChart = dc.lineChart("#date-chart");
	var newcustChart = dc.lineChart("#newcust-chart");
	var resourceTypeChart = dc.rowChart("#resource-chart");
	var genderSalesChart = dc.pieChart("#gender-chart");
	var custSourcePie = dc.pieChart("#csourcePie-chart");
	var stateCountChart = dc.barChart("#statecount-chart");

	// var resourceTypeChart = dc.dataTable("#resource-chart");

  	selectField = dc.selectMenu('#menuselect')
        .dimension(custState)
        .group(stateGroup); 

       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);


	netOrders
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(netTotalOrders)
		.formatNumber(d3.format(".3s"));

	netSales
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(netTotalSales)
		.formatNumber(d3.format(".3s"));

	dateChart
		//.width(600)
		.height(220)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(weekNum)
		// .group(projectsByDate)
		.group(salespriceByWeek,"Weekly Sales ($)")
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([1, 52]))
		// .x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("2015 Week Number#")
		.legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
		.ordinalColors(["#56B2EA","#E064CD","#F8B700","#78CC00","#7B71C5"])
		.yAxis().ticks(6);

	newcustChart
		//.width(600)
		.height(220)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(weekNum)
		// .group(projectsByDate)
		.group(custReturn, 'Returning Customers')
		.stack(custNew,'New Customers')
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([1, 52]))
		// .x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("2015 Week Number#")
		.legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
		.elasticX(true)
        .brushOn(false)
        .ordinalColors(["#56B2EA","#E064CD","#F8B700","#78CC00","#7B71C5"])
		.yAxis().ticks(6);	

	resourceTypeChart
        //.width(300)
        .height(220)
        // .dimension(salesPrice)
        .dimension(prodCategory)
        .group(salespriceByCat)
        .elasticX(true)
        .ordinalColors(["#56B2EA","#E064CD","#F8B700","#78CC00","#7B71C5"])
        .xAxis().ticks(5);

    dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);

    genderSalesChart
            .height(220)
            //.width(350)
            .radius(90)
            .innerRadius(40)
            .transitionDuration(1000)
            .dimension(genderStatus)
            .ordinalColors(["#56B2EA","#E064CD","#F8B700","#78CC00","#7B71C5"])
            .group(salespriceByGender);

    custSourcePie
            .height(300)
            //.width(350)
            .radius(140)
            .innerRadius(20)
            .transitionDuration(1000)
            .dimension(custSource)
            .ordinalColors(["#56B2EA","#E064CD","#F8B700","#78CC00","#7B71C5"])
            .group(salespriceByCustSource);

    stateCountChart
    	//.width(800)
        .height(220)
        .transitionDuration(1000)
        .dimension(custState)
        .group(salescountByState)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(custState))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .ordering(function(d){return d.value;})
        .ordinalColors(["#56B2EA","#E064CD","#F8B700","#78CC00","#7B71C5"])
        .yAxis().tickFormat(d3.format("s"));

    dc.renderAll();

};