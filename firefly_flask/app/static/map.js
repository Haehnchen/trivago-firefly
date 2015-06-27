

$(function() {

    var uri = $('#map-canvas').data('uri');
    if (typeof uri === 'undefined') {
        uri = 'marker.json';
    }

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

    function collectNearestImages(lat, lng, max, radius, sfn) {

        var uri1 = uri.replace('{lat}', lat).replace('{lng}', lng);

        $.get(uri1, {'lat': lat, 'lng': lng, 'radius': radius}, function(data) {

            var mySort = data['photos'].filter(function(item) {
                return 'url_o' in item;
            });

            mySort.sort(function(a, b) {
                return b['count_faves'] - a['count_faves'];
            });

            var items = mySort.slice(0, max);

            fn(items);
        })
    }

    function max(items, field) {

        var max = 0;

        $.each(items, function(index, value) {
            if(field in value && value[field] > max) {
                max = value[field];
            }
        });

        return max;
    }

    function loadMarker(lat, lng) {

        var uri1 = uri.replace('{lat}', lat);
        uri1 = uri1.replace('{lng}', lng);

        $.get(uri1, {'lat': lat, 'lng': lng, 'q': q}, function( data ) {

            if(!('photos' in data)) {
                alert('foo no photos');
                return;
            }

            var maxFav = max(data['photos'], 'count_faves');

            $.each(data['photos'], function( index, value ) {

                value['latitude'] = parseFloat(value['latitude']);
                value['longitude'] = parseFloat(value['longitude']);

                if(!('url_o' in value)) {
                    return;
                }

                var weight = ('count_faves' in value) ? ((maxFav / 100) * value['count_faves']) : 10;
                if(weight == 0) {
                    weight = 5;
                }

                heatMapData.push({
                    location: new google.maps.LatLng(value['latitude'], value['longitude']),
                    weight: weight / 100,
                    _data: value
                });

                // first marker is center
                if(!centerMarker) {
                    centerMarker = new google.maps.LatLng(value['latitude'], value['longitude']);
                }

            });

            initialize();

            console.log(heatMapData.length)
        });
    }

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
            data: heatMapData,
            radius: 35,
            opacity: 0.8
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
                    var modal = $('#myModal');

                    var imgRows = '';

                    collectNearestImages(value['_data']['latitude'], value['_data']['longitude'], 5, 10, function(items) {

                        $.each(items, function(index, value) {
                            imgRows += '<div class="col-md-6"><img class="img-responsive" src="' + value['url_o']  + '"></div>';
                        });

                        modal.find('.modal-body .sub-image').html(imgRows);

                    });


                    modal.find('.modal-body .image').html('<img class="img-responsive" src="' + value['_data']['url_o'] + '">');


                    if(typeof value['_data']['description']['_content'] !== 'undefined' && value['_data']['description']['_content'].length > 0) {
                        modal.find('.modal-title').html(value['_data']['title']);
                    } else {
                        modal.find('.modal-title').html('&nbsp;');
                    }


                    var p = ['<b>' + value['_data']['ownername'] + '</b>'];
                    if(typeof value['_data']['description']['_content'] !== 'undefined') {
                        p.push(value['_data']['description']['_content']);
                    }

                    var desc = truncate(p.join(' - '), 60);

                    modal.find('.desc').html(desc);
                    modal.find('.views').html('<small>Views: ' + value['_data']['views'] + "</small>");
                    modal.modal('show');

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


var truncate = function (str, limit) {
    return jQuery.trim(str).substring(0, limit)
            .split(" ").slice(0, -1).join(" ") + "...";
};
