'use strict';
var rp = require('request-promise');
var router = require('express').Router();
var Promise = require('bluebird')
var request = require('bluebird').promisifyAll(require('request'));
module.exports = router;

var statesArr = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', null, 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', null, 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

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

router.get('/:state', function(req, res, next){
    rp('https://quickstats.nass.usda.gov/api/api_GET/?key=657A7402-DF3A-3C12-A7D6-FFCC1DDE180D&format=json&year=2015&commodity_desc=SOYBEANS&statisticcat_desc=PRODUCTION&agg_level_desc=COUNTY&unit_desc=BU&prodn_practice_desc=ALL%20PRODUCTION%20PRACTICES&reference_period_desc=YEAR', 
	function(error, response, html){
        if(error) console.error(error);
	})
	.then(function(allCounties){
		var countiesInStateArr = [];
		JSON.parse(allCounties).data.forEach(function(countyObj){
			if(req.params.state.toUpperCase() === countyObj.state_name){ // has to be foreach instead of map because map will lead to undefined in many cases
				countiesInStateArr.push(countyObj.county_name)
			}
		})
		return countiesInStateArr;
	})
	.then(function(countiesInStateArr){
		var locationData = [];
		countiesInStateArr.forEach(function(countyName){
			if(countyName !== 'OTHER (COMBINED) COUNTIES'){ // Sometimes counties were combined in this format. Of course, I could not make a request with this in the URL
				var requestURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + countyName + 'county' + req.params.state  + '&key=AIzaSyC8_rkwUi_ESKzVFrwCZDSnmpGKqoerzBg';
				var locData = new Promise(function (resolve, reject) {
			        request(requestURL, function (error, response, html) {
			            if(JSON.parse(html).results[0]) resolve({name: JSON.parse(html).results[0].address_components[0].long_name, location: JSON.parse(html).results[0].geometry.location});
			        });
			    });
			    locationData.push(locData)
			}
		})
		return locationData;
	})
	.then(function(urls){
		return Promise.all(urls)
	})
	.then(function(locs){
		var rainfalls = locs.map(function(latLonObj){
			var requestURL = 'http://api.openweathermap.org/data/2.5/weather?lat=' + latLonObj.location.lat + '&lon=' + latLonObj.location.lng + '&appid=ff105b42113b33159d146c1bba50e637';
			return new Promise(function (resolve, reject) {
		        request(requestURL, function (error, response, html) {
		            resolve({name:latLonObj.name, rainfall: JSON.parse(html).rain});
		        });
		    });
		})
		return rainfalls
	})
	.then(function(rainfalls){
		return Promise.all(rainfalls)
	})
	.then(function(nameAndRainFall){
		var finalizedCountyData = [];
	    rp('http://eric.clst.org/wupl/Stuff/gz_2010_us_050_00_20m.json', 
		function(error, response, html){
	        if(error) console.error(error);
	        JSON.parse(html).features.forEach(function(countyLocData){
        	    if(Number(countyLocData.properties.STATE) === statesArr.indexOf(req.params.state)+1){
        	    	countyLocData.properties.rainfall = findRainFall(nameAndRainFall, countyLocData.properties.NAME);
        	    	countyLocData.properties.isSoybeanState = true;
        	    	countyLocData.properties.isState = false;
        	    	finalizedCountyData.push(countyLocData);
        	    }
	        })
	        res.send(finalizedCountyData)
		})
	})
});















