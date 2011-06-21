// Set the hash to nothing for page load. We want the user to always start in the same place.

if( window.location.hash != "" )
{
	window.location = "http://" + window.location.hostname;
}



$(document).ready(function()
{
	$.mobile.page.prototype.options.backBtnTheme = "c";
	
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

$('#settings').live('pageshow',function(event, ui){
	$( "#distance" ).val(Fuel.Settings.distance);
	$( "#distance" ).slider('refresh');
});

$(document).when("mobileinit stationListLoad ready").done( function(){
	// Declare variables	
	var fuelMap = new Fuel.Map(document.getElementById("map")),
		brandsSelectObj = $('#brands'),
		vouchersSelectObj = $('#vouchers'),
		productsSelectObj = $('#products'),
		distanceObj = $( "#distance" ),
		destinationObj = $( "#addDestination" ),
		searchObj = $("#search"),
		saveSettingsObj = $("#saveSettings");
	
	// Populate dropdowns
	for (var i=0; i < Fuel.Settings.Base.brandList.length; i++) {
		brandsSelectObj.append('<option value="' + i + '" selected="selected">' +  Fuel.Settings.Base.brandList[i] + '</option>');
	};
	
	for ( var productCode in Fuel.Settings.Base.products ){
		productsSelectObj.append('<option value="' + productCode + '">' + Fuel.Settings.Base.products[productCode] + '</option>');
	}
	
	for (var i=0; i < Fuel.Settings.Base.voucherList.length; i++) {
		vouchersSelectObj.append('<option value="' + i + '">' +  Fuel.Settings.Base.voucherList[i].title + '</option>');
	}
		
	// Setup helper functions for dropdowns
	brandsSelectObj.getSelected = function(){
		var selectedArray = [];
	
		$("option:selected", this).each(function () {
	        selectedArray.push($(this).text());
	
		});
		
		return selectedArray;
	};
	vouchersSelectObj.getSelected = function(){
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

	saveSettingsObj.bind("vclick", function()
	{
		$.mobile.showPageLoadingMsg();
		Fuel.Settings.products = productsSelectObj.val();
		Fuel.Settings.voucherList = vouchersSelectObj.getSelected();
		Fuel.Settings.brands = brandsSelectObj.getSelected();
		Fuel.Settings.distance = distanceObj.val();

		Fuel.Settings.save();
	});

	// Setup onclicks for search
	searchObj.bind("vclick", function(){
		$("#resultView").empty();
		if( $("#fromAddress").val().length > 0 )
		{
			$.mobile.showPageLoadingMsg();
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
					$.mobile.changePage($("#nothingFound"));
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
				createSideListStations,
				function(){
					$.mobile.changePage($("#nothingFound"));
				}
			);
		}
	});
	
	var event = "click";
	if (Modernizr.touch){
		event = "tap";
	}
	
	destinationObj.bind(event, function(){
		var container = $('<div class="ui-field-contain ui-body ui-br"><label class="removeDestination"><a href="index.html" data-role="button" data-icon="minus" class="removeButton">&nbsp;</a></label></div>');
		var button = $('<input value=""  data-theme="d" />');
		$("#addressList").append(container.append(button));
		$("a", container).button().bind(event, function()
		{
			container.remove();
			return false;
		});
		button.textinput();
		button.addClass('newDestination');
		
		return false;
	});
	
	doGeolocation();
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
				var stationObj = $("<li><a><h3>" + station.getPrice() + "</h3><p>" + station.tradingName + "</p></a></li>");
				
				priceContainer.append(stationObj);
				stationObj.bind("vclick", function()
				{
					if( $("html").hasClass('small') )
					{
						
						$.mobile.changePage($("#mapContainer"));
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
	
		try
		{
			priceContainer.listview('refresh');
		}
		catch( ex )
		{
			
		}
		
		$.mobile.changePage($("#results"), 'none');	
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
						$.mobile.pageLoading();
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