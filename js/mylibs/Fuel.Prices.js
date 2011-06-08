(function() {
		
	var stationList = [],
	brandList = [],
	brandMap = {},
	products = {
		1: "Unleaded Petrol",
		2: "Premium Unleaded",
		4: "Diesel",
		5: "LPG",
		6: "98 RON",
		7: "B20 diesel"
	},
	voucherList = [
		{
			amount: 4,
			title: "Woolworths 4c",
			brand: "Caltex Woolworths"
		},
		{
			amount: 8,
			title: "Woolworths 8c",
			brand: "Caltex Woolworths"
		},
		{
			amount: 6,
			title: "Coles 6c",
			brand: "Coles Express"
		},
		{
			amount: 4,
			title: "Coles 4c",
			brand: "Coles Express"
		}
	];
	
	$.getJSON("/prices.js", function(rtnData)
	{
		for (var i=0; i < rtnData.data.length; i++) {
			var station = new Fuel.Station(rtnData.data[i]);
	
			stationList.push(station);
		
			if( !$.isArray( brandMap[station.brand] ) )
			{
				brandMap[station.brand] = [];
			}
		
			brandMap[station.brand].push(station);
		};
		
		for ( var brand in brandMap )
		{
			brandList.push(brand);
		}
		
		Fuel.Prices = {
			stationList: stationList,
			brandList: brandList,
			brandMap: brandMap,
			products: products,
			voucherList: voucherList
		};
		
		$('body').trigger("priceLoad");
	});
})()













