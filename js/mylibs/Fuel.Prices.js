Fuel.Prices = function (onComplete)
{
	this.load(onComplete);
}

Fuel.Prices.prototype.load = function(onComplete)
{
	var self = this;
	self.stationList = [];
	self.brandList = [];
	self.brandMap = {};
	
	$.getJSON(this.url, function(data)
	{
		for (var i=0; i < data.length; i++) {
			var station = new Fuel.Station(data[i]);
			self.stationList.push(station);
		
			if( !$.isArray( self.brandMap[station.brand] ) )
			{
				self.brandMap[station.brand] = [];
			}
		
			self.brandMap[station.brand].push(station);
		};
		
		for ( var brand in self.brandMap )
		{
			self.brandList.push(brand);
		}

		onComplete(self);
	});
	
};

Fuel.Prices.prototype.url = "/data/prices.js";

Fuel.Prices.prototype.products = {
	1: "Unleaded Petrol",
	2: "Premium Unleaded",
	4: "Diesel",
	5: "LPG",
	6: "98 RON",
	7: "B20 diesel"
};

Fuel.Prices.prototype.voucherList = [
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





