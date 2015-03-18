
$(document).ready(function() {

    $('ul#places').on('click', 'a#details', function() {
        var id = $(this).attr('place-id');
        var division = $(this).attr('place-division');
        var html = "";
        $.ajax({
            type: "GET",
            url: "data/places.xml",
            dataType: "xml",
            success: function(data) {
                var place = $(data).find('divisions').find(division).find('place[id=' + id + ']');
                var name = place.find('name').text();
                var address = place.find('address').text();
                var detail = place.find('detail').text();
                var open = place.find('open').text();
                var image = place.find('image').text();
                html += '<ul id="listview-name" class="ui-listview ui-group-theme-b"><li class="ui-li-divider ui-bar-b ui-first-child ui-last-child"><h4 id="name">' + name + '</h4></li></ul><img id="image" src="'+image+'" alt=""><p id="detail">'+detail+'</p><ul class="ui-listview ui-group-theme-b" id="listview-address"><li class="ui-li-divider ui-bar-b ui-first-child"><h4>Address</h4></li><li class="ui-li-static ui-body-inherit"><p id="address">'+address+'</p></li><li class="ui-li-divider ui-bar-b"><h4>Visting time</h4></li><li class="ui-li-static ui-body-inherit ui-last-child"><p id="open">'+open+'</p></li></ul>';
                $('div#detail-new').html(html);
            }
        });
        $.mobile.changePage($('#place-detail'), {transition: "pop"});
    });

    $('#divisions').find('li').find('a').each(function() {
        $(this).click(function() {
            var division = $(this).attr('data-division');
            $.ajax({
                type: "GET",
                url: "data/places.xml",
                dataType: "xml",
                success: function(data) {
                    var html = "";
                    $(data).find('divisions').find(division).find('place').each(function() {

                        var id = $(this).attr('id');
                        var name = $(this).find('name').text();
                        var image = $(this).find('image').text();
                        var details = $(this).find('detail').text().substr(0, 150) + "...";
                        html += '<li style="" class="ui-li-divider ui-bar-b ui-first-child"><h4>' + name + '</h4></li><li class="ui-li-has-thumb ui-last-child" data-filtertext="' + name + '"><a place-division="' + division + '" place-id="' + id + '" class="ui-btn ui-btn-icon-right ui-icon-carat-r" id="details"><img src="' + image + '" alt="' + name + '"><p>' + details + '</p></a></li>';
                    });
                    $('ul#places').html(html);
                },
                error: function(data) {
                }
            });
            $.mobile.changePage($('#places-list'), {transition: "pop"});
        });
    });

    $('ul#help-link').find('li').find('a').each(function() {
        $(this).click(function() {
            var type = $(this).data('type');
            $('#help').find('ul').find('li').find('a').each(function() {
                $(this).attr('data-type', type);
            });
            $.mobile.changePage($('#help'), {transition: "pop"});
        });
    });

    $('ul#help-list').on('click', 'a#call', function() {
        var number = $(this).attr('data-number');
        var call = new MozActivity({
            name: "dial",
            data: {
                number: number
            }
        });
    });
    $('#help').find('ul#help-division').find('li').find('a').each(function() {
        $(this).click(function() {

            var division = $(this).attr('data-division');
            var type = $(this).attr('data-type');
            $.ajax({
                type: "GET",
                url: "data/" + type + ".xml",
                dataType: "xml",
                success: function(data) {
                    var html = "";
                    $(data).find('help').find(division).find(type).each(function() {
                        $('ul').find('li#help-name').show(0);
                        $('ul').find('li#help-data').show(0);
                        var name = $(this).find('name').text();
                        var address = $(this).find('address').text();
                        var phone = $(this).find('phone').text();
                        html += '<li class="ui-li-divider ui-bar-b ui-first-child"><h4>' + name + '</h4></li><li class="ui-last-child" data-filtertext="' + address + '"><a id="call" class="ui-btn ui-btn-icon-right ui-icon-phone" data-number="+' + phone + '"><p id="address">' + address + '</p></a></li>';
                    });

                    $('ul#help-list').find('li#help-name').hide(0);
                    $('ul#help-list').find('li#help-data').hide(0);
                    $('ul#help-list').html(html);
                }, error: function(data) {
                    console.log(data);
                }
            });

            $.mobile.changePage($('#help-details'), {transition: "pop"});
        });
    });

    $('a[data-icon=location]').each(function() {
        $(this).click(function() {
            findMyCurrentLocation();
        });
    });
    $('a[data-icon=navigation]').click(function() {
        routeMyCurrentLocation();
    });

    function routeMyCurrentLocation() {
        var geoService = navigator.geolocation;
        if (geoService) {
            navigator.geolocation.getCurrentPosition(routeCurrentLocation, errorHandler, {enableHighAccuracy: true});
        } else {
            alert("Your Browser does not support GeoLocation.");
        }
    }
    function routeCurrentLocation(position) {
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        //Set Google Map options
        var options = {
            zoom: 6,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var $content = $("#map-page div:jqmData(role=content)");

        //Set the height of the div containing the Map to rest of the screen
        $content.height(screen.height - 50);

        //Display the Map
        var map = new google.maps.Map($content[0], options);

        //Create the Marker and Drop It
        new google.maps.Marker({map: map,
            animation: google.maps.Animation.DROP,
            position: latlng
        });

        var address = $('#listview-address').find('p#address').text();
        var geocoder = new google.maps.Geocoder();
        var geocoderRequest = {
            address: address + ",Bangladesh"
        };
        geocoder.geocode(geocoderRequest, function(results, status) {

            // Check if status is OK before proceeding
            if (status == google.maps.GeocoderStatus.OK) {

                // Do something with the response 
                var marker = new google.maps.Marker({
                    map: map
                });
                marker.setPosition(results[0].geometry.location);
            }
            var route = [
                latlng,
                results[0].geometry.location
            ];

            var polyline = new google.maps.Polyline({
                path: route,
                map: map
            });
            polyline.setMap(map);
        });

    }

    function findMyCurrentLocation() {
        var geoService = navigator.geolocation;
        if (geoService) {
            navigator.geolocation.getCurrentPosition(showCurrentLocation, errorHandler, {enableHighAccuracy: true});
        } else {
            alert("Your Browser does not support GeoLocation.");
        }
    }

    function showCurrentLocation(position) {


        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        //Set Google Map options
        var options = {
            zoom: 6,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var $content = $("#map-page div:jqmData(role=content)");

        //Set the height of the div containing the Map to rest of the screen
        $content.height(screen.height - 50);

        //Display the Map
        var map = new google.maps.Map($content[0], options);

        //Create the Marker and Drop It
        new google.maps.Marker({map: map,
            animation: google.maps.Animation.DROP,
            position: latlng
        });
    }

    function errorHandler(error) {
        alert("Error while retrieving current position. Error code: " + error.code + ",Message: " + error.message);
    }
});