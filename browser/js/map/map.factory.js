'use strict';

app.factory('mapFactory', function($http) {
    var MapFactory = {};

    function resToData(res) {
        return res.data;
    }

    MapFactory.getStateData = function(){
        return $http.get('/api/states')
        .then(resToData);
    }

    MapFactory.getCountyData = function(stateName){
        return $http.get('/api/counties/' + stateName)
        .then(resToData);
    }

    return MapFactory;
});