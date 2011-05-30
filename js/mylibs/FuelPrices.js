function FuelPrices(onComplete)
{

	this.load(onComplete);
}


FuelPrices.prototype.load = function(onComplete)
{

	var self = this;
		$.ajax({
		        type: "GET",
			url: this.url,
			data:{'Product':2},
			dataType: "xml",
			success: function(result) {
				
				self.stationList = [];
				self.brandList = [];
				self.brandMap = {};
				
				$(result).find('item').each(function()
				{
					var station = Station.loadFromXml(this);
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
				
				if( onComplete )
				{
					onComplete(self);
				}
			}
	});
};

FuelPrices.prototype.url = "prices.php";

FuelPrices.prototype.products = {
	"Unleaded Petrol": 1,
	"Premium Unleaded": 2,
	"Diesel": 4,
	"LPG": 5,
	"98 RON": 6,
	"B20 diesel": 7
};

FuelPrices.prototype.voucherList = [
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



function Station()
{
};

Station.loadFromXml = function(xml)
{
	var xml = $(xml);
	var station = new Station();
	station.title = xml.find('title').text();
	station.description = xml.find('description').text();
	station.brand = xml.find('brand').text();
	station.price = xml.find('price').text();
	station.tradingName = xml.find('trading-name').text();
	station.location = xml.find('location').text();
	station.address = xml.find('address').text();
	station.phone = xml.find('phone').text();
	station.latlng = new google.maps.LatLng(xml.find('latitude').text(),xml.find('longitude').text());
	return station;
}

Station.prototype.applyVoucher = function(amount)
{
	this.voucher = amount;
}

Station.prototype.getPrice = function()
{
	var price = new Number(this.price);
	if( this.voucher !== undefined )
	{
		price -= this.voucher;
	}
	
	return price.toFixed(2);
}


