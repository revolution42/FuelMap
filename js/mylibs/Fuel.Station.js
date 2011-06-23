Fuel.Station = function Station(object)
{
	this.title = object.tradingName;
	this.brand = object.brand;
	this.prices = object.prices;
	this.pricesTomorrow = object.pricesTomorrow;
	this.tradingName = object.tradingName;
	this.location = object.location;
	this.address = object.address;
	this.phone = object.phone;
	this.latlng = new google.maps.LatLng(object.lat,object.lng);
	this.tomorrow = false;
};

Fuel.Station.prototype.applyVoucher = function(amount){
	this.voucher = amount;
};

Fuel.Station.prototype.hasProduct = function(productType)
{
	if( this.prices[productType] )
	{
		return true;
	}
	
	return false;
};


Fuel.Station.prototype.getPrice = function()
{
	var price = this.prices[Fuel.Settings.fuelType];
	
	if( Fuel.Settings.tomorrow )
	{
		price = this.pricesTomorrow[Fuel.Settings.fuelType];
	}
	
	price = new Number(price);
	if( this.voucher !== undefined )
	{
		price -= this.voucher;
	}
	
	return price.toFixed(2);
};

(function() {
	var stationList = [],
	brandList = [],
	brandMap = {};
	$.getJSON("/prices.js", function(rtnData)
	{
		for (var i=0; i < rtnData.data.length; i++) {
			var station = new Fuel.Station(rtnData.data[i]);
	
			stationList.push(station);
		
			if( !$.isArray( brandMap[station.brand] ) )
			{
				brandMap[station.brand] = [];
			}
		};
		
		for ( var brand in brandMap )
		{
			brandList.push(brand);
		}
		
		Fuel.Station.list = stationList;
		Fuel.Settings.Base.brandList = brandList;
		Fuel.Settings.load();
		
		$(document).trigger("stationListLoad");
	});
}());