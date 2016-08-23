'use strict';
var rp = require('request-promise');
var router = require('express').Router();
var Promise = require('bluebird')
var request = require('bluebird').promisifyAll(require('request'));
module.exports = router;

function findRainFall(rainfallArr, stateName){
	for(var i = 0; i < rainfallArr.length; i++){
		if(stateName === rainfallArr[i].name){
			if(rainfallArr[i].rainfall){
				if(Object.keys(rainfallArr[i].rainfall).length === 0){ // this is required if a state has a rainfall object but it is empty
					return {soybeanState: true, rainfall: 0};
				} else{
					return rainfallArr[i].rainfall['1h'] || rainfallArr[i].rainfall['3h']
				}
			}
		}
	}
	return 0;
}

function isItSoybeanState(soybeansStateArr, stateName){
	for(var i = 0; i < soybeansStateArr.length; i++){
		if(stateName.toUpperCase() === soybeansStateArr[i]){
			return true;
		}
	}
	return false;
}

router.get('/', function(req, res, next){
	var soybeansStateNamesArr = [];
    rp('https://quickstats.nass.usda.gov/api/api_GET/?key=657A7402-DF3A-3C12-A7D6-FFCC1DDE180D&format=json&year=2015&commodity_desc=SOYBEANS&statisticcat_desc=PRODUCTION&agg_level_desc=STATE&unit_desc=BU&prodn_practice_desc=ALL%20PRODUCTION%20PRACTICES&reference_period_desc=YEAR', 
	function(error, response, html){
        if(error) console.error(error);
	})
	.then(function(soybeanStates){
		JSON.parse(soybeanStates).data.forEach(function(state){
			soybeansStateNamesArr.push(state.state_name)
		})
	})
	.then(function(){
		return soybeansStateNamesArr.map(function(stateName){
			var requestURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + stateName + '&key=AIzaSyC8_rkwUi_ESKzVFrwCZDSnmpGKqoerzBg';
			return new Promise(function (resolve, reject) {
		        request(requestURL, function (error, response, html) {
		            resolve({name: JSON.parse(html).results[0].address_components[0].long_name, location: JSON.parse(html).results[0].geometry.location});
		        });
		    });
		})
		// return urlsboi
	})
	.then(function(urls){
		return Promise.all(urls)
	})
	.then(function(locs){
		return locs.map(function(latLonObj){
			var requestURL = 'http://api.openweathermap.org/data/2.5/weather?lat=' + latLonObj.location.lat + '&lon=' + latLonObj.location.lng + '&appid=ff105b42113b33159d146c1bba50e637';
			return new Promise(function (resolve, reject) {
		        request(requestURL, function (error, response, html) {
		            resolve({name:latLonObj.name, rainfall: JSON.parse(html).rain});
		        });
		    });
		})
		// return rainfallsboi
	})
	.then(function(fallsboi){
		return Promise.all(fallsboi)
	})
	.then(function(nameAndRainFall){
	    rp('http://eric.clst.org/wupl/Stuff/gz_2010_us_040_00_20m.json', 
		function(error, response, html){
	        if(error) console.error(error);
	        var finalizedStateData = JSON.parse(html).features.map(function(stateLocData){
	        	stateLocData.properties.rainfall = findRainFall(nameAndRainFall, stateLocData.properties.NAME);
	        	stateLocData.properties.isSoybeanState = isItSoybeanState(soybeansStateNamesArr, stateLocData.properties.NAME);
	        	stateLocData.properties.isState = true;
	        	return stateLocData
	        })
	        res.send(finalizedStateData)
		})
	})
});








