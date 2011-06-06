// Set the hash to nothing for page load. We want the user to always start in the same place.
window.location.hash = "";

$(document).ready(function()
{
	//new iScroll('wrapper');
	
	applyWidth();
	
	$(window).resize(applyWidth);
	
	function applyWidth()
	{
		$("#results").height($('#mapContainer').height() -75);
		
		$('#mapContainer').height('auto');
		$('#mapContainer .full').height($('#mapContainer').height() -42);
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


var fuelMap;
var fuelPrices;
var brands = $('#brands');
var vouchers = $('#vouchers');
	var products = $('#products');
	var distance = $( "#distance" );
	var search = $("#search");
	
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

	
$(document).ready(function()
{
	

	fuelPrices = new Fuel.Prices(function(priceList)
	{
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
		
		fuelMap = new Fuel.Map(document.getElementById("map"), priceList);
		
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
						$.mobile.changePage("#results");
						

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
		
		$('select').selectmenu("refresh");
	});
	
	
	
	search.click(function()
	{
		route();
		//return false;
	});
	
	search.button({
            icons: {
                primary: "ui-icon-search"
            }
        });
	


	
	/*
	if (!Modernizr.touch){
	
		brands.multiselect({
			height: 'auto'
		});
		
		vouchers.multiselect({
			height: 'auto'
		});
		
		products.multiselect({
			multiple: false,
			height: 'auto'
		});
	}*/
		
	/*	distance.slider({
			value:1,
			min: 0,
			max: 10,
			step: 0.5,
			slide: function( event, ui ) {
				
			$( "#amount" ).html( ui.value );
			}
		});
		$( "#amount" ).html(distance.slider( "value" ) );*/
	

});


function route()
{
	fuelMap.route(
		document.getElementById("fromAddress").value,
		document.getElementById("toAddress").value,
		2,/* @TODO uses the slider values */
		brands.getSelected(),
		vouchers.getSelected(),
		products.val(),
		createSideListStations
	);
}

function createSideListStations(stationList)
{

	var priceContainer = $("#resultView");	
			priceContainer.empty();
			//$("#controls").hide("slide", { direction: "left" }, 1000);
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
	
	try
	{
		priceContainer.listview('refresh');
	}
	catch( ex )
	{
		
	}

}
