app.config(function ($stateProvider) {
    $stateProvider.state('map', {
        url: '/',
        templateUrl: '/js/map/map.html',
        controller: 'MapCtrl',
        resolve: {
        	statesData: function(mapFactory){
        		return mapFactory.getStateData();
        	}
        }
    });
});