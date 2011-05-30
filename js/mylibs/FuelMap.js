function FuelMap(mapCanvas, fuelPrices){
	this.load(mapCanvas, fuelPrices);
}

FuelMap.prototype.load = function(mapCanvas, fuelPrices){
	var mapOptions = {
        center: new google.maps.LatLng(-31.970804,115.856323),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 4
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

FuelMap.prototype.route = function(fromAddress, toAddress, distance, brands, vouchers, callback){
	this.clearOverlays();
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

			callback(self.addOverlays(boxes, brands, vouchers));
		}
	});
}

FuelMap.prototype.addOverlays = function(boxes, brands, vouchers)
{
	var stations = [];
	
	for (var i = 0; i < boxes.length; i++) {
  		for (var j = 0; j < this.fuelPrices.stationList.length; j++) {
			var station = this.fuelPrices.stationList[j];
	
			if( ($.inArray(station.brand, brands) > -1) && boxes[i].contains(station.latlng) )
	  		{
	  			stations.push(station);
	  			if( vouchers[station.brand] !== undefined )
	  			{
	  				station.applyVoucher(vouchers[station.brand].amount)
	  			}

	  			var styleIcon = new StyledIcon(StyledIconTypes.BUBBLE,{color:"#ff0000",text:station.getPrice()});
	    		var styleMaker1 = new StyledMarker({styleIcon:styleIcon,position:station.latlng,map:this.map});
				this.markersArray.push(styleMaker1);
			}
		}
	}
	
	return stations.sort(FuelMap.sortPrices);

}

FuelMap.prototype.clearOverlays = function()
{
	for (marker in this.markersArray) {
		this.markersArray[marker].setMap(null);
	}
    this.markersArray.length = 0;
}


FuelMap.sortPrices = function(a, b){
	return (a.getPrice() - b.getPrice())
}