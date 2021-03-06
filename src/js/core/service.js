app.factory('stationService', ['$resource', '$cacheFactory', '$rootScope', function($resource, $cacheFactory, $rootScope) {
    var cache = $cacheFactory('stationService');
    var Stations = $resource($rootScope.iRailAPI + "/stations/?lang=en&format=json");

    return {
        getResource: function(callback) {
            var stationNames = cache.get("stations");
            if (!stationNames) {
                Stations.get(function(data){
                    stationNames = parseStationData(data.station);
                    cache.put("stations", stationNames);
                    callback(stationNames);
                });
            }else{
                callback(stationNames);
            }
        }
    };

    //parse the station json to an array of stationNames
    function parseStationData(stationData){
        var stationNames = [];
        for(var i = 0; i<stationData.length; i++){
            var station = stationData[i];
            stationNames.push(station.name)
        }
        return stationNames;
    }
}]);

app.factory('utilityService', function (){
    return {
        // pads the given value to two digits
        addLeadingZeroIfNeeded: function(data){
            if(data < 10){
                return "0" + data.toString();
            }
            return data.toString();
        },

        //change svg to png if not supported (can't happen on page load because angular loads some stuff dynamically)
        pngFallback: function(){
            if (!Modernizr.svg) {
                // wrap this in a closure to not expose any conflicts
                (function() {
                    // grab all images. getElementsByTagName works with IE5.5 and up
                    var imgs = document.getElementsByTagName('img'),endsWithDotSvg = /.*\.svg$/,i = 0,l = imgs.length;
                    // quick for loop
                    for(; i < l; ++i) {
                        if(imgs[i].src.match(endsWithDotSvg)) {
                            // replace the png suffix with the svg one
                            imgs[i].src = imgs[i].src.slice(0, -3) + 'png';
                        }
                    }
                })();
            }
        },

        //get a string that contains a date in the format specified by the iRail api specs (ddmmyy)
        getIrailDateString: function(date){
            var dayString = this.addLeadingZeroIfNeeded(date.getDate());
            var monthString = this.addLeadingZeroIfNeeded(date.getMonth()+1);
            var yearString = date.getFullYear().toString().substr(2);

            return dayString + monthString + yearString;
        },

        // get a string that contains the time in the format specified by the iRail api specs (hhmm)
        getIrailTimeString: function(date){
            var hourString = this.addLeadingZeroIfNeeded(date.getHours());
            var minuteString = this.addLeadingZeroIfNeeded(date.getMinutes());

            return hourString + minuteString;
        }
    }
});

// service to store new favorite routes
// (might be better of as a directive)
app.factory('favoriteRouteService', ['localStorageService', '$rootScope', function(localstorageService, $rootScope){
    return {
        addFavorite: function( from, to ){
            var favorites = this.get();

            //duplicates
            for(var i = 0; i < favorites.length; i++){
                var element = favorites[i];
                if(element.from == from && element.to == to){
                    return;
                }
            }
            favorites.push({'from': from, 'to': to});
            localstorageService.add('favoriteRoutes', JSON.stringify(favorites));
        },

        removeFavorite: function(from, to){
            //todo refactor to use exists function
            var favorites = JSON.parse(localstorageService.get('favoriteRoutes'));

            if(!favorites){
                return;
            }

            for( var i = 0; i < favorites.length; i++ ){
                var element = favorites[i];

                if(element.from == from && element.to == to){
                    favorites.splice(i, 1);
                    localstorageService.add('favoriteRoutes', JSON.stringify(favorites));
                    return;
                }
            }
            $rootScope.$broadcast('favoritesChanged');
        },

        getFavorites: function(){
            var favorites = JSON.parse(localstorageService.get('favoriteRoutes'));

            if(!favorites){
                favorites = [];
            }
            return favorites;
        },

        exists: function(from, to){
            var favorites = JSON.parse(localstorageService.get('favoriteRoutes'));

            if(!favorites){
                return false;
            }

            for( var i = 0; i < favorites.length; i++ ){
                var element = favorites[i];

                if(element.from == from && element.to == to){
                    return true;
                }
            }

            return false;
        }
    }
}]);

app.factory('historyService', ['localStorageService', function(localStorageService){
    return {
        add: function(date, from, to, latitude, longitude){
            var history = this.get();

            var historyObject = {
                'datetime': date,
                'location' : {
                    'longitude' : longitude,
                    'latitude' : latitude
                } ,
                'from': from,
                'to': to
            };

            history.push(historyObject);
            localStorageService.add('history', JSON.stringify(history));
        },

        get : function(){
            var history = JSON.parse(localStorageService.get('history'));

            if(!history){
                history = [];
            }

            return history;
        }
    }
}]);

// Service abstracting geolocation and the geolocation fallback
app.factory('geolocationService', function(){
    return {
        getCurrentPosition: function(callback, options){
            if(Modernizr.geolocation){
                navigator.geolocation.getCurrentPosition(positionFound, geolocation_error, options);
            }else{
                yepnope({
                    load: 'js/geoPosition.js',
                    callback: function(){
                        if (geoPosition.init()){
                            geoPosition.getCurrentPosition(positionFound, geolocation_error, options);
                        }
                    }
                });
            }

            function positionFound(position){
                callback(position)
            }
        }
    };

    function geolocation_error(){
        console.error("Geolocation is not available");
    }
});