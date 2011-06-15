// Set the hash to nothing for page load. We want the user to always start in the same place.
window.location.hash = "";

$(document).ready(function()
{
	var iphone = false;
	if( (navigator.userAgent.match(/iPhone/i)))  {
		iphone = true;
	}
		
	applyWidth();
	
	$(window).resize(applyWidth);
	
	function applyWidth()
	{
		$("#results").height($('#mapContainer').height() -75);
		
		$('#mapContainer').height('auto');
		$('#mapContainer .full').height($('#mapContainer').height() - 42);
		$('html').removeClass("small").removeClass("large");


		if( $(window).width() < 600 || iphone)
		{
			$('html').addClass("small");
		}
		else
		{
			$('html').addClass("large");
		}
	}
});

$('body').bind("priceLoad", function()
{
	// Declare variables	
	var priceList = Fuel.Prices,
		fuelMap = new Fuel.Map(document.getElementById("map"), priceList),
		brands = $('#brands'),
		vouchers = $('#vouchers'),
		products = $('#products'),
		distance = $( "#distance" ),
		destination = $( "#addDestination" ),
		search = $("#search");
	
	// Populate dropdowns
	for (var i=0; i < priceList.brandList.length; i++) {
		brands.append('<option value="' + i + '" selected="selected">' +  priceList.brandList[i] + '</option>');
	};
	
	for ( var productCode in priceList.products ){
		products.append('<option value="' + productCode + '">' + priceList.products[productCode] + '</option>');
	}
	
	for (var i=0; i < priceList.voucherList.length; i++) {
		vouchers.append('<option value="' + i + '">' +  priceList.voucherList[i].title + '</option>');
	};
	$('select').selectmenu("refresh");
	


	// Setup helper functions for dropdowns
	brands.getSelected = function(){
		var selectedArray = [];
	
		$("option:selected", this).each(function () {
	        selectedArray.push($(this).text());
	
		});
		
		return selectedArray;
	};
	vouchers.getSelected = function(){
		var selectedVouchers = {};
	
		$("option:selected", this).each(function () {  	
			
			var voucher = fuelPrices.voucherList[$(this).val()];
	
			if( selectedVouchers[voucher.brand] !== undefined )
			{
				if( selectedVouchers[voucher.brand].amount < voucher.amount )
				{
	
					selectedVouchers[voucher.brand] = voucher;
				}
			}
			else
			{
				
	        	selectedVouchers[voucher.brand] = voucher;
	   
	       	}
	
		});
	
		return selectedVouchers;
	};

	// Setup onclicks for search
	search.click(function(){
		
		if( $("#fromAddress").val().length > 0 )
		{
			$.mobile.pageLoading();
			var destinations = $("input.newDestination");
			
			if( destinations.length == 0 )
			{
				singleSearch();
			}
			else
			{
				multiSearch();
			}				
		}

		return false;
		
		function singleSearch() {
			var address = $("#fromAddress").val();
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode( { 'address': address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {

				    setSingleLocation(results[0].geometry.location);
				    
				} else {
					console.log('location not found');
					// TODO Nice message if nothing found
				}
			});	  
		}
		
		function multiSearch()
		{
			var addressArray = [
				{
					location: $("#fromAddress").val()
				}
			];
			
			$("input.newDestination").each( function()
			{
				addressArray.push({
					location: this.value
				});
			});
			
			fuelMap.route(
				addressArray,
				2,// @TODO uses the slider values 
				brands.getSelected(),
				vouchers.getSelected(),
				products.val(),
				
				createSideListStations
			);
		}
	});
	
	destination.click(function(){
		var container = $('<div class="ui-field-contain ui-body ui-br"><label class="removeDestination"><a href="index.html" data-role="button" data-icon="delete" class="removeButton">&nbsp;</a></label></div>');
		var button = $('<input value=""  data-theme="d" />');
		$("#addressList").append(container.append(button));
		$("a", container).button().click(function()
		{
			container.remove();
			return false;
		});
		button.textinput();
		button.addClass('newDestination');
		
		return false;
	});
	
	doGeolocation();
	$('#loader').remove();
	//
	// FUNCTIONS
	// ---------------------------------------------------------------
	//


	/**
	 * Create the html for the sidelist.
	 * @param stationList A list of stations
	 */
	function createSideListStations(stationList)
	{
		var priceContainer = $("#resultView");	
		priceContainer.empty();
	
		$.each( stationList, function(i, station)
		{
			if( i < 10 )
			{
				var stationObj = $("<li><a><h3>" + station.getPrice(products.val()) + "</h3><p>" + station.tradingName + "</p></a></li>");
				
				priceContainer.append(stationObj);
				stationObj.click(function()
				{
					if( $("html").hasClass('small') )
					{
						$.mobile.pageLoading();
						$.mobile.changePage("#mapContainer");
						$("#map").css({
							width: '100%',
							height: '100%'
						});
						google.maps.event.trigger(fuelMap.map, 'resize');
					}
		
					$("#resultView li").removeClass('ui-btn-active');
					fuelMap.map.setCenter(station.latlng);
					fuelMap.map.setZoom(15);
				});
			}
		});
	
		// TODO Find a nicer solution for this, sometimes the pricecontainer hasn't been fully initialised before its been populated by this function.
		try
		{
			priceContainer.listview('refresh');
		}
		catch( ex )
		{
			
		}
		
			$.mobile.changePage("#results", 'none');	
	}
	
	function setSingleLocation(latlng)
	{
		fuelMap.clearMap();
		
		var stations = fuelMap.addStationMarkers([Fuel.Map.createBoxAroundPoint(latlng, 5)]);
		createSideListStations(stations);

		fuelMap.map.setCenter(latlng);
		var marker = new google.maps.Marker({
		      position: latlng,
		      title:"Your Location"
		  });
		  marker.setMap(fuelMap.map); 
			
	}
	
	/**
	 * Check to see if geolocation is supported.
	 * Centre the map on users location.
	 */
	function doGeolocation()
	{
		if( typeof navigator.geolocation != 'undefined' )
		{
			try
			{
				navigator.geolocation.getCurrentPosition(
					function(position)
					{
						var userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
						setSingleLocation(userLocation);

						var geocoder = new google.maps.Geocoder();
						geocoder.geocode({latLng: userLocation},
							function( data, status )
							{
								if( google.maps.GeocoderStatus.OK == status && data.length > 0 )
								{
									var firstAddress = data[0];
									$('#fromAddress').val(firstAddress.formatted_address);

								}
							}
						);
					},
					function(error)
					{
						// @TODO Give a nice message to users that have location disabled
						//alert(error.code + ': ' + error.message);
					}
				);
			}
			catch(e)
			{
			}
		}
	}
});
