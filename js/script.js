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
		
		distance.slider({
			value:1,
			min: 0,
			max: 10,
			step: 0.5,
			slide: function( event, ui ) {
				
			$( "#amount" ).html( ui.value );
			}
		});
		$( "#amount" ).html(distance.slider( "value" ) );
		
		if( typeof navigator.geolocation != 'undefined' )
		{
			try
			{
				navigator.geolocation.getCurrentPosition(
					function(position)
					{
						var userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

						//fuelMap.addStationMarkers();
						fuelMap.map.setCenter(userLocation);
						var marker = new google.maps.Marker({
						      position: userLocation,
						      title:"Your Location"
						  });
						  marker.setMap(fuelMap.map); 
						
						

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
						alert(error.code + ': ' + error.message);
					}
				);
			}
			catch(e)
			{
			}
		}
	});
	
	search.click(function()
	{
		route();
		return false;
	});
	
	search.button({
            icons: {
                primary: "ui-icon-search"
            }
        });
	

	var back = $(".back");
	back.button({
            icons: {
                primary: "ui-icon-circle-arrow-w"
            }
        });

	back.click(function()
	{
		$("#controls").show("slide", { direction: "left" }, 1000);
	});

});


function route()
{
	fuelMap.route(
		document.getElementById("fromAddress").value,
		document.getElementById("toAddress").value,
		parseFloat($( "#distance" ).slider( "value" )),
		brands.getSelected(),
		vouchers.getSelected(),
		products.val(),
		function(stationList)
		{
			var priceContainer = $("#stationList .content");	
			priceContainer.empty();
			$("#controls").hide("slide", { direction: "left" }, 1000);
			$.each( stationList, function(i, station)
			{
				var stationObj = $("<a class='station ui-button ui-widget ui-state-default ui-corner-all ui-state-hover'>" + station.getPrice(products.val()) + "<br/>" + station.tradingName + "</a>");
				
				priceContainer.append(stationObj);
				stationObj.click(function()
				{
					fuelMap.map.setCenter(station.latlng);
					fuelMap.map.setZoom(15);
				});
			})
		}
		
	);
}
