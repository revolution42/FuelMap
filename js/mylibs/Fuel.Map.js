
Fuel.Map = function(mapCanvas, fuelPrices){
	this.load(mapCanvas, fuelPrices);
}

Fuel.Map.prototype.load = function(mapCanvas, fuelPrices){
	var mapOptions = {
        center: new google.maps.LatLng(-31.970804,115.856323),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 15,
        mapTypeControl: false
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

Fuel.Map.prototype.route = function(addressList, callback, onfail){
	this.clearMap();
	
	var self = this;
	var callback = callback;
	var request = {
		origin: addressList[0].location,
		destination: addressList[addressList.length-1].location,
		travelMode: google.maps.DirectionsTravelMode.DRIVING,
		waypoints: addressList.splice(1, addressList.length-2)
	};
	
	// Make the directions request
	this.directionService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			self.directionsRenderer.setMap(self.map);
			self.directionsRenderer.setDirections(result);
			var boxes = self.routeBoxer.box(result.routes[0].overview_path, Fuel.Settings.distance);

			callback(self.addStationMarkers(boxes));
		}
		else
		{
			onfail();
		}
	});
}

/**
 * 
 * @boxes An array of LatLngBounds
 */
Fuel.Map.prototype.addStationMarkers = function(boxes)
{
 	this.removeStationMarkers();
	var stations = [];
	
	var stationList = Fuel.Station.list;
	
	stationList.filter(Fuel.Map.fuelMapFilter);

	for (var j = 0; j < stationList.length; j++) {
		var station = stationList[j];
		var boxesCheck = true;
		
		if( boxes )
		{
			boxesCheck = false;
			for (var i = 0; i < boxes.length; i++) {
	  			if( boxes[i].contains(station.latlng) )
				{
					boxesCheck = true;
					break;
				}
			}
		}
		
		if( boxesCheck )
  		{
  			stations.push(station);
  			var styleIcon = new StyledIcon(StyledIconTypes.BUBBLE,{color:"#ff0000",text:station.getPrice()});
    		var styleMaker1 = new StyledMarker({styleIcon:styleIcon,position:station.latlng,map:this.map});
			this.markersArray.push(styleMaker1);
		}
	}

	return stations.sort(Fuel.Map.sortPrices);
}

/**
 * Clear all markers, routes etc from the map.
 */
Fuel.Map.prototype.clearMap = function(){
	this.directionsRenderer.setMap(null);
	this.removeStationMarkers();
}

Fuel.Map.prototype.removeStationMarkers = function()
{
	for (marker in this.markersArray) {
		this.markersArray[marker].setMap(null);
	}
    this.markersArray.length = 0;
}

Fuel.Map.fuelMapFilter = function(element, index, array){
	
	if( ($.inArray(element.brand, Fuel.Settings.brands) > -1) && element.hasProduct(Fuel.Settings.product) )
	{
		if( (Fuel.Settings.vouchers.length > 0) && (Fuel.Settings.vouchers[element.brand] !== undefined ) )
		{
			element.applyVoucher(Fuel.Settings.vouchers[element.brand].amount)
		}
		
		return true;
	}
	
	return false;
}

Fuel.Map.sortPrices = function(a, b){
	return (a.getPrice() - b.getPrice())
}

Fuel.Map.createBoxAroundPoint = function(latlng, distance)
{
	var ne = Fuel.Map.findPoint(latlng.lat(),latlng.lng(),45,distance/2);
    var sw = Fuel.Map.findPoint(latlng.lat(),latlng.lng(),225,distance/2);

    return new google.maps.LatLngBounds (sw, ne);
}

/**
 * brng is the direction
 * dist is the distance
 */
Fuel.Map.findPoint = function(lat,lng,brng, dist) {
    this._radius = 6371;
    dist = typeof(dist) == 'number' ? dist : typeof(dist) == 'string' && dist.trim() != '' ? +dist : NaN;
    dist = dist / this._radius;
    brng = brng.toRad();  
    var lat1 = lat.toRad(),
        lon1 = lng.toRad();

    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) + Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));
    var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) * Math.cos(lat1), Math.cos(dist) - Math.sin(lat1) * Math.sin(lat2));
    lon2 = (lon2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    return new google.maps.LatLng(lat2.toDeg(),lon2.toDeg());
}
