

$(function() {

    function setDIVHeight() {
        var theDiv = $('.map-canvas-wrap');
        var divTop = theDiv.offset().top;
        var winHeight = $(window).height();
        var divHeight = winHeight - divTop;
        theDiv.height(divHeight);
    }

    setDIVHeight();

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

    q = ucfirst(q)

    search(q, function(loc) {
        loadMarker(loc.lat, loc.lng);
    });

    var heatMapData = [];

    var centerMarker;

    function collectNearestImages(lat, lng, max, radius, fn) {

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

        google.maps.event.addListener(map, 'click', function(e) {
            var value = getNearestDistance(heatMapData, e.latLng.lat(), e.latLng.lng());
            openModal(value);
        });

        heatmap.setMap(map);

        var items = getVisibleItems(heatMapData, 4);

        $.each(items, function( index, value ) {

            var img = 'http://placehold.it/50x50';
            if('url_sq' in value['_data']) {
                img = value['_data']['url_sq'];
            }

            var marker = new RichMarker({
                position: value['location'],
                map: map,
                draggable: false,
                content: '<div class="map-img-box-thumbnail"><img src="' + img + '"></div>'
            });

            if('url_sq' in value['_data']) {

                google.maps.event.addListener(marker, 'click', function() {
                    openModal(value);
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

    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    function getNearestDistance(heatMapData, lat, lng) {

        var nearest;
        var dist;

        $.each(heatMapData, function(index, value) {

            var cDist = getDistanceFromLatLonInKm(lat, lng, value['_data']['latitude'], value['_data']['longitude']);
            if(!dist || cDist < dist) {
                nearest = value;
                dist = cDist;
            }

        });

        return nearest;
    }

    function openModal(value) {

        var modal = $('#myModal');

        modal.find('.modal-body .hotel-ad').addClass('hide');

        var imgRows = '';

        collectNearestImages(value['_data']['latitude'], value['_data']['longitude'], 5, 10, function(items) {

            $.each(items, function(index, value) {
                imgRows += '<div class="col-md-6"><img class="img-responsive" src="' + value['url_sq']  + '"></div>';
            });

            modal.find('.modal-body .sub-image').html(imgRows);

        });

        var service = new google.maps.places.PlacesService(map);

        service.nearbySearch({
            location: new google.maps.LatLng(value['_data']['latitude'], value['_data']['longitude']),
            radius: 500,
            types: ['lodging']
        }, function callback(results, status) {

            if(results.length == 0) {
                return;
            }

            modalHotelAd(modal, results[0]);

        });

        modal.find('.modal-body .image').html('<img class="img-responsive" src="' + value['_data']['url_m'] + '">');


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

        var opts = {
            'views': 'Views',
            'count_faves': 'Favorites',
            'count_comments': 'Comments'
        };

        var text = [];
        $.each(opts, function(index, item) {
            if(index in value['_data'] && value['_data'][index] > 0) {
                text.push(item + ": " + value['_data'][index]);
            }
        });

        if(text.length > 0) {
            modal.find('.views').html('<small>' + text.join(' - ') + "</small>");
        } else {
            modal.find('.views').html('');
        }


        modal.modal('show');
    }

    function ucfirst(str) {
        str += '';
        var f = str.charAt(0)
            .toUpperCase();
        return f + str.substr(1);
    }

    function modalHotelAd(modal, result) {

        modal.find('.modal-body .hotel-ad').removeClass('hide');

        if(typeof result['image'] !== 'undefined') {
            modal.find('.modal-body .hotel-ad img').attr('src', '');
        } else {
            modal.find('.modal-body .hotel-ad img').attr('src', 'http://www.immigrantspirit.com/wp-content/uploads/2014/08/building.jpg');
        }

        modal.find('.modal-body .hotel-ad .ad-dist').html(getRandomInt(5, 30) + ' km');

        if(typeof result['name'] !== 'undefined') {
            modal.find('.modal-body .hotel-ad .ad-title').html(truncate(result['name'], 90));
        } else {
            modal.find('.modal-body .hotel-ad .ad-title').html('');
        }

        if(typeof result['description'] !== 'undefined') {
            modal.find('.modal-body .hotel-ad .ad-dec').html(truncate(result['description'], 120));
        } else {
            modal.find('.modal-body .hotel-ad .ad-dec').html('');
        }

        console.log(result);
    }

});


var truncate = function (str, limit) {
    return jQuery.trim(str).substring(0, limit)
            .split(" ").slice(0, -1).join(" ") + "...";
};
