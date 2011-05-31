Fuel.Map = function(mapCanvas, fuelPrices){
	this.load(mapCanvas, fuelPrices);
}

Fuel.Map.prototype.load = function(mapCanvas, fuelPrices){
	var mapOptions = {
        center: new google.maps.LatLng(-31.970804,115.856323),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 15
      };

	this.map = new google.maps.Map(mapCanvas, mapOptions);
	this.routeBoxer = new RouteBoxer();
	this.directionService = new google.maps.DirectionsService();
	this.directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map, draggable: true });
	this.markersArray = [];
	this.directions = null;
	this.distance = null;
	this.fuelPrices = fuelPrices;
}

Fuel.Map.prototype.route = function(fromAddress, toAddress, distance, brands, vouchers, callback){
	var self = this;
	var callback = callback;
	var request = {
		origin: fromAddress,
		destination: toAddress,
		travelMode: google.maps.DirectionsTravelMode.DRIVING
	};

	// Make the directions request
	this.directionService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			self.directionsRenderer.setDirections(result);
			var boxes = self.routeBoxer.box(result.routes[0].overview_path, distance);

			callback(self.addStationMarkers(boxes, brands, vouchers));
		}
	});
}

/**
 * 
 * @boxes An array of LatLngBounds
 */
Fuel.Map.prototype.addStationMarkers = function(boxes, brands, vouchers)
{
 	this.removeStationMarkers();
	var stations = [];
	
	for (var j = 0; j < this.fuelPrices.stationList.length; j++) {
		var station = this.fuelPrices.stationList[j];
		var brandsCheck = true;
		var boxesCheck = true;
		
		if( brands )
		{
			brandsCheck = false;
			for (var i = 0; i < boxes.length; i++) {
	  			if( ($.inArray(station.brand, brands) > -1) )
				{
					brandsCheck = true;
					break;
				}
			}
		
		}
				
		if( brandsCheck && boxesCheck )
  		{
  			stations.push(station);
  			if( vouchers && vouchers[station.brand] !== undefined )
  			{
  				station.applyVoucher(vouchers[station.brand].amount)
  			}

  			var styleIcon = new StyledIcon(StyledIconTypes.BUBBLE,{color:"#ff0000",text:station.getPrice()});
    		var styleMaker1 = new StyledMarker({styleIcon:styleIcon,position:station.latlng,map:this.map});
			this.markersArray.push(styleMaker1);
		}
	}

	return stations.sort(Fuel.Map.sortPrices);
}

Fuel.Map.prototype.removeStationMarkers = function()
{
	for (marker in this.markersArray) {
		this.markersArray[marker].setMap(null);
	}
    this.markersArray.length = 0;
}

Fuel.Map.sortPrices = function(a, b){
	return (a.getPrice() - b.getPrice())
}