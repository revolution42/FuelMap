<?php

error_reporting(E_ALL);
ini_set('display_errors','On');
set_time_limit(200); 

function getStationFromXml($regionId, &$stationList, $priceTypeId)
{
	$contents =file_get_contents('http://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Region=' . $regionId . '&Product=' . $priceTypeId);
	
	$string = 'trading-name';
	
	$xml = new SimpleXMLElement($contents);

	$itemList = $xml->xpath('/rss/channel/item');
	
	foreach( $itemList as $item )
	{
		$tradingName = $item->$string;
		
		if( isset($stationList[str_replace(" ", "", $tradingName)]) )
		{
			$station = $stationList[str_replace(" ", "", $tradingName)];
		}
		else
		{		
			$station = new Station((string)$item->description, (string)$item->brand, (string)$tradingName, (string)$item->location, (string)$item->address, (string)$item->phone, (string)$item->latitude, (string)$item->longitude);
		}
		$station->addPrice($priceTypeId, (string)$item->price);
		
		$stationList[str_replace(" ", "", $tradingName)] = $station;
	}
}

class Station
{
	public $description;
	public $brand;
	public $tradingName;
	public $location;
	public $address;
	public $phone;
	public $lat;
	public $lng;
	public $prices = array();
	
	function __construct($description, $brand, $tradingName, $location, $address, $phone, $lat, $lng)
	{
	
		$this->description = $description;
		$this->brand = $brand;
		$this->tradingName = $tradingName;
		$this->location = $location;
		$this->address = $address;
		$this->phone = $phone;
		$this->lat = $lat;
		$this->lng = $lng;
	}
	
	function addPrice($priceTypeId, $price)
	{
		$this->prices[$priceTypeId] = $price;
	}
}

$types = array(
	1,// - Unleaded Petrol
	2,// - Premium Unleaded
	4,// - Diesel
	5,// - LPG
	6,// - 98 RON
	7,// - B20 diesel
);

$regionArray = array(
	25,
	26,
	27,
	15,
	28,
	30,
	1,
	2,
	16,
	3,
	29,
	19,
	4,
	33,
	5,
	34,
	35,
	31,
	36,
	6,
	20,
	37,
	38, 
	39,
	7,
	40,
	41,
	17,
	21,
	22,
	42,
	8,
	43,
	9,
	44,
	45,
	10,
	18,
	32,
	46,
	47,
	48,
	23,
	11,
	49,
	50,
	12,
	13,
	51,
	14,
	53,
	24,
	54,
	55,
	56
);

$stationList = array();

foreach( $regionArray as $regionId )
{
	echo "Getting region: " . $regionId . "<br />";
	
	foreach( $types as $typeId )
	{
		echo $typeId;
		getStationFromXml($regionId, $stationList, $typeId);
	}
	echo "<br /><br />";

}
$values = array_values($stationList);

$myFile = "data/prices.js";
$fh = fopen($myFile, 'w') or die("can't open file");
fwrite($fh, json_encode($values));
fclose($fh);


