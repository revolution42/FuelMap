Fuel.Settings = {
	distance: 2,
	brands: [],
	vouchers: [],
	fuelType: 1,
	load: function(){
		// Load saved settings
		var loadedSettings = $.parseJSON(readCookie('settings'));

		if( loadedSettings !== null )
		{
			this.distance = loadedSettings.distance;
			this.brands = loadedSettings.brands;
			this.vouchers = loadedSettings.vouchers;
			this.fuelType = loadedSettings.fuelType;
		}

		if( brands.length == 0 )
		{
			brands = Fuel.Settings.Base.brandList;
		}
	},
	save: function(){
		// Save settings
		createCookie('settings',JSON.stringify({
			
				distance:this.distance,
				brands:this.brands,
				vouchers:this.vouchers,
				fuelType:this.fuelType
		}));
	}
};

Fuel.Settings.Base = {
	products: {
		1: "Unleaded Petrol",
		2: "Premium Unleaded",
		4: "Diesel",
		5: "LPG",
		6: "98 RON",
		7: "B20 diesel"
	},
	voucherList: [
		{
			amount: 4,
			title: "Woolworths 4c",
			brand: "Caltex Woolworths"
		},
		{
			amount: 8,
			title: "Woolworths 8c",
			brand: "Caltex Woolworths"
		},
		{
			amount: 6,
			title: "Coles 6c",
			brand: "Coles Express"
		},
		{
			amount: 4,
			title: "Coles 4c",
			brand: "Coles Express"
		}
	]
};