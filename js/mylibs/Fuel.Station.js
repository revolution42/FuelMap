Fuel.Station = function Station()
{
};

Fuel.Station.loadFromXml = function(xml)
{
	var xml = $(xml);
	var station = new Fuel.Station();
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

Fuel.Station.prototype.applyVoucher = function(amount)
{
	this.voucher = amount;
}

Fuel.Station.prototype.getPrice = function()
{
	var price = new Number(this.price);
	if( this.voucher !== undefined )
	{
		price -= this.voucher;
	}
	
	return price.toFixed(2);
}
