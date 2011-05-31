Fuel.Prices = function (onComplete)
{
	this.load(onComplete);
}

Fuel.Prices.prototype.load = function(onComplete)
{
	var self = this;
	
	this.getPricesXml(function(fuelPriceXml)
	{	
		self.stationList = [];
		self.brandList = [];
		self.brandMap = {};

		$(fuelPriceXml).find('item').each(function()
		{
			var station = Fuel.Station.loadFromXml(this);
			self.stationList.push(station);
			
			if( !$.isArray( self.brandMap[station.brand] ) )
			{
				self.brandMap[station.brand] = [];
			}
		
			self.brandMap[station.brand].push(station);
			
		});
			
		for ( var brand in self.brandMap )
		{
			self.brandList.push(brand);
		}

		onComplete(self);
	});		
};

Fuel.Prices.prototype.getPricesXml = function(callback)
{
	var currentTime = new Date()
	var dateString = currentTime.getFullYear() + "-" +  (currentTime.getMonth() + 1) + "-" +  currentTime.getDate();
	
	if (Modernizr.localstorage) {
		if( localStorage['priceXmlDate'] == dateString )
		{
			callback(localStorage['priceXml']);
			return;
		}
		localStorage['priceXmlDate'] = null;
	  	localStorage['priceXml'] = null;
	}
	
	
	var self = this;
	$.ajax({
		type: "GET",
		url: this.url,
		data:{'Product':2},
		dataType: "text",
		success: function(result) {
			if (Modernizr.localstorage) {			
				localStorage['priceXmlDate'] = dateString;
			  	localStorage['priceXml'] = result.toString();
			}
			callback(result);
		}
	});
}

Fuel.Prices.prototype.url = "prices.php";

Fuel.Prices.prototype.products = {
	"Unleaded Petrol": 1,
	"Premium Unleaded": 2,
	"Diesel": 4,
	"LPG": 5,
	"98 RON": 6,
	"B20 diesel": 7
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





