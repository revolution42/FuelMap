Fuel.Station = function Station(object)
{
	this.title = object.tradingName;
	this.brand = object.brand;
	this.prices = object.prices;
	this.tradingName = object.tradingName;
	this.location = object.location;
	this.address = object.address;
	this.phone = object.phone;
	this.latlng = new google.maps.LatLng(object.lat,object.lng);
	

};

Fuel.Station.prototype.applyVoucher = function(amount)
{
	this.voucher = amount;
}

Fuel.Station.prototype.hasProduct = function(productType)
{
	if( this.prices[productType] )
	{
		return true;
	}
	
	return false;
}

Fuel.Station.prototype.getPrice = function(priceType)
{
	if( priceType === undefined )
	{
		priceType = "1";
	}
	
	var price = this.prices[priceType];
	

	
	price = new Number(price);
	if( this.voucher !== undefined )
	{
		price -= this.voucher;
	}
	
	return price.toFixed(2);
}
