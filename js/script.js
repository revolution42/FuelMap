// Set the hash to nothing for page load. We want the user to always start in the same place.
window.location.hash = "";

$(document).ready(function()
{
	applyWidth();
	
	$(window).resize(applyWidth);
	
	function applyWidth()
	{
		$("#results").height($('#mapContainer').height() -75);
		
		$('#mapContainer').height('auto');
		$('#mapContainer .full').height($('#mapContainer').height() - 42);
		$('html').removeClass("small").removeClass("large");

		if( $(window).width() < 600 )
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
		search = $("#search");
	
	// Populate dropdowns
	for (var i=0; i < priceList.brandList.length; i++) {
		brands.append('<option value="' + i + '" selected="selected">' +  priceList.brandList[i] + '</option>');
	};
	
	for ( var productCode in priceList.products )
	{
		products.append('<option value="' + productCode + '">' + priceList.products[productCode] + '</option>');
	}
	
	for (var i=0; i < priceList.voucherList.length; i++) {
		vouchers.append('<option value="' + i + '">' +  priceList.voucherList[i].title + '</option>');
	};
	$('select').selectmenu("refresh");
	


	// Setup helper functions for dropdowns
	brands.getSelected = function()
	{
		var selectedArray = [];
	
		$("option:selected", this).each(function () {
	        selectedArray.push($(this).text());
	
		});
		
		return selectedArray;
	};
	vouchers.getSelected = function()
	{
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
	search.click(function()
	{
		fuelMap.route(
			$("#fromAddress").val(),
			$("#toAddress").val(),
			2,/* @TODO uses the slider values */
			brands.getSelected(),
			vouchers.getSelected(),
			products.val(),
			createSideListStations
		);
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
			var stationObj = $("<li><a><h3>" + station.getPrice(products.val()) + "</h3><p>" + station.tradingName + "</p></a></li>");
			
			priceContainer.append(stationObj);
			stationObj.click(function()
			{
				if( $("html").hasClass('small') )
				{
					$.mobile.changePage("#mapContainer");
					 google.maps.event.trigger(fuelMap.map, 'resize');
				}
	
				$("#resultView li").removeClass('ui-btn-active');
				fuelMap.map.setCenter(station.latlng);
				fuelMap.map.setZoom(15);
			});
		});
	
		// TODO Find a nicer solution for this, sometimes the pricecontainer hasn't been fully initialised before its been populated by this function.
		try
		{
			priceContainer.listview('refresh');
		}
		catch( ex )
		{
			
		}
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

						var stations = fuelMap.addStationMarkers([Fuel.Map.createBoxAroundPoint(userLocation, 5)]);
						createSideListStations(stations);
						
						fuelMap.map.setCenter(userLocation);
						var marker = new google.maps.Marker({
						      position: userLocation,
						      title:"Your Location"
						  });
						  marker.setMap(fuelMap.map); 
						$.mobile.changePage("#results", 'none');
						

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
