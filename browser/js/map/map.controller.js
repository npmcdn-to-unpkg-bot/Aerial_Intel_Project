app.controller('MapCtrl', function ($scope, statesData, mapFactory) {

    var mapboxAccessToken = 'pk.eyJ1IjoiY2FkaWxsYWMiLCJhIjoiY2lwYWg1d2NuMDAzbnRsbmozN3gxbGI5eiJ9.NfnE3Rw-ahS2snpQkQmtmw';
    var map = L.map('map').setView([37.8, -96], 4);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
        id: 'mapbox.light',
    }).addTo(map);

    L.geoJson(statesData).addTo(map);

    function getColor(d) {
        return d > 12 ?   '#034e7b' :
                d > 10  ?  '#0570b0' :
                d > 8  ?  '#3690c0' :
                d > 6  ?  '#74a9cf' :
                d > 4   ?  '#a6bddb' :
                d > 2   ?  '#d0d1e6' :
                d > 0   ?  '#ece7f2' :
                            '#fff7fb';
    }


    // Adds color to states. If it is not a soybean producing state, it is grayed out
    function style(feature) {
        if(!feature.properties.isSoybeanState){
            return {
                fillColor:'#d3d3d3',
                weight: 2,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7
            };
        } else{
            return {
                fillColor: getColor(feature.properties.rainfall),
                weight: 2,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7
            };
        }
    }

    L.geoJson(statesData, {style: style}).addTo(map);

    // Outline the state the user is hovering over. If it isnt a soybean state, dont show the outline
    function highlightFeature(e) {
        if(e.target.feature.properties.isSoybeanState){
            var layer = e.target;

            layer.setStyle({
                weight: 3,
                color: '#034e7b',
                dashArray: '',
                fillOpacity: 0.7
            });

            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
        }
    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    }

    function zoomToFeature(e) {
        if(e.target.feature.properties.isSoybeanState){
            var clickedStateName = e.target.feature.properties.NAME;
            mapFactory.getCountyData(clickedStateName)
            .then(function(counties){
                L.geoJson(counties).addTo(map);
                map.fitBounds(e.target.getBounds());
                // Allows you to click on other states even if there is already a state is selected
                geojson = L.geoJson(statesData, {
                    style: style,
                    onEachFeature: onEachFeature
                }).addTo(map);

                L.geoJson(counties, {style: style}).addTo(map);
            })
        }
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    // Allows you to click on other states even if there is already a state is selected
    geojson = L.geoJson(statesData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);




    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 2, 4, 6, 8, 10, 12],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);

})