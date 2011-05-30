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
	
	
	fuelPrices = new FuelPrices(function(priceList)
	{
		
		for (var i=0; i < priceList.brandList.length; i++) {
			//console.log(priceList.brandList[i]);
			brands.append('<option value="' + i + '" selected="selected">' +  priceList.brandList[i] + '</option>');
		};
		
		for ( var product in priceList.products )
		{
			products.append('<option value="' + priceList.products[product] + '">' + product + '</option>');
		}
		
		for (var i=0; i < priceList.voucherList.length; i++) {
			//console.log(priceList.brandList[i]);
			vouchers.append('<option value="' + i + '">' +  priceList.voucherList[i].title + '</option>');
		};
		
		fuelMap = new FuelMap(document.getElementById("map"), priceList);
		
		
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
		function(stationList)
		{
			var priceContainer = $("#stationList .content");	
			priceContainer.empty();
			$("#controls").hide("slide", { direction: "left" }, 1000);
			$.each( stationList, function(i, station)
			{
				var stationObj = $("<a class='station ui-button ui-widget ui-state-default ui-corner-all ui-state-hover'>" + station.getPrice() + "<br/>" + station.tradingName + "</a>");
				
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
