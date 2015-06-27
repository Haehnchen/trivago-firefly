

$(function() {

    function search(address, fn) {

        console.log('address search ' + address);

        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({ 'address': address }, function (results, status) {

            if (status == google.maps.GeocoderStatus.OK) {

                console.log(results[0].geometry.location);

                fn({
                    'lat': results[0].geometry.location.lat(),
                    'lng': results[0].geometry.location.lng()
                });

                return;
            }

            alert('No results found: ' + status);
        });
    }

    var q = $('#map-canvas').data('q');
    if (typeof q === 'undefined') {
        alert('The q is missing');
        return;
    }

    search(q, function(loc) {
        loadMarker(loc.lat, loc.lng);
    });

    var heatMapData = [];

    var centerMarker;

    function loadMarker(lat, lng) {

        var uri = $('#map-canvas').data('uri');
        if (typeof uri === 'undefined') {
            uri = 'marker.json';
        }

        uri = uri.replace('{lat}', lat).replace('{lat}', lng);

        $.get(uri, {'lat': lat, 'lng': lng, 'q': q}, function( data ) {

            if(!('photos' in data)) {
                alert('foo no photos');
                return;
            }

            $.each(data['photos'], function( index, value ) {

                value['latitude'] = parseFloat(value['latitude']);
                value['longitude'] = parseFloat(value['longitude']);

                var weight = 1;

                if(!('url_o' in value)) {
                    //console.log('invalid item ' + value['id'])
                    return;
                }

                if('weight' in value ) {
                    weight = value["weight"];
                }

                heatMapData.push({
                    location: new google.maps.LatLng(value['latitude'], value['longitude']),
                    weight: weight,
                    _data: value
                });

                // first marker is center
                if(!centerMarker) {
                    centerMarker = new google.maps.LatLng(value['latitude'], value['longitude']);
                }

            });

            initialize()

            console.log(heatMapData.length)
        });
    }


    $('#pic-content').on('click', function() {
        $(this).removeClass('vis');
    });


    // Adding 500 Data Points
    var map, pointarray, heatmap;

    function initialize() {
        var mapOptions = {
            zoom: 9,
            center: centerMarker
            //mapTypeId: google.maps.MapTypeId.SATELLITE
        };

        map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions
        );

        heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatMapData
        });

        heatmap.setMap(map);

        var items = getVisibleItems(heatMapData, 4);

        $.each(items, function( index, value ) {

            var img = 'http://placehold.it/50x50';
            if('url_o' in value['_data']) {
                img = value['_data']['url_o'];
            }

            var marker = new RichMarker({
                position: value['location'],
                map: map,
                draggable: false,
                content: '<div class="map-img-box-thumbnail"><img src="' + img + '"></div>'
            });

            if('url_o' in value['_data']) {

                google.maps.event.addListener(marker, 'click', function() {

                    $('#pic-content').addClass('vis');
                    $('#pic-content').find('.content').html('<img src=" ' + value['_data']['url_o'] + '">')

                });

            }

        });

    }

    function getVisibleItems(heatMapData, max) {

        var items = [];

        var mySort = heatMapData;
        mySort.sort(function(a, b) {
            return b['_data']['count_faves'] - a['_data']['count_faves'];
        });

        return mySort.slice(0, max);

        var i;
        for (i = 0; i < max; i++) {
            var num = getRandomInt(0, heatMapData.length - 1);
            items.push(heatMapData[num]);
        }

        return items;

        getRandomInt(0, 5);


        var index;
        for (index = 0; index < heatMapData.length; ++index) {

            // replace with field catch
            if(getRandomInt(0, 5) == 1) {
                items.push(heatMapData[index]);
            }

            if(items.length == max) {
                return items;
            }

        }

        return items;
    }



    function toggleHeatmap() {
        heatmap.setMap(heatmap.getMap() ? null : map);
    }

    function changeGradient() {
        var gradient = [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
        ]
        heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
    }

    function changeRadius() {
        heatmap.set('radius', heatmap.get('radius') ? null : 20);
    }

    function changeOpacity() {
        heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }



});