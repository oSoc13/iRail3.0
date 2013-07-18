// Copyright OKFN Belgium
// Author: Nik Torfs

var app = angular.module('iRail', ['ngResource']);

//App routes definition
app.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider){
        $routeProvider.
            when('/', {templateUrl: 'views/home.html', controller: DirectionsCtrl}).
            when('/route/:fromStation/:toStation/:dateString/:timeString/:timeSelection', {templateUrl: 'views/route.html', controller: RouteCtrl}).
            when('/train/:trainId', {templateUrl: 'views/train.html', controller: TrainCtrl}).
            when('/station/:stationName', {templateUrl: 'views/station-liveboard.html', controller: StationDetailCtrl}).
            otherwise({redirectTo: '/'});
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        //intercept http requests from the provider and show a spinner when this happens
        $httpProvider.responseInterceptors.push('httpInterceptor');
        var spinnerFunction = function (data, headersGetter) {
            $('#spinner').show();
            return data;
        };
        $httpProvider.defaults.transformRequest.push(spinnerFunction);
    }]);

app.factory('stationService', function($resource, $cacheFactory, $rootScope) {
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
    }

    //parse the station json to an array of stationNames
    function parseStationData(stationData){
        var stationNames = [];
        for(var i = 0; i<stationData.length; i++){
            var station = stationData[i];
            stationNames.push(station.name)
        }
        return stationNames;
    }
});

app.factory('utilityService', function (){
    return {
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
        }
    }

});

app.factory('httpInterceptor', function ($q) {
    return function (promise) {
        return promise.then(function (response) {
            // do something on success
            // todo hide the spinner
            $('#spinner').hide();
            return response;
        }, function (response) {
            // do something on error
            // todo hide the spinner
            $('#spinner').hide();
            return $q.reject(response);
        });
    };
});


/*
 * A replace function that replaces the matched regex result with the given replacement
 * input: given by AngularJS
 * regex: a regex string (without the starting and ending forward slash, e.g.: '[ ]\\[.*\\]$')
 * replacement: the string that replaces a match
 */
app.filter('replace', function() {
    return function(input, regex, replacement) {
        var patt = new RegExp(regex);
        var out = input.replace(patt, replacement);
        console.log(out);
        return out;
    };
});

app.directive('autoComplete', function($timeout, stationService) {

    /*
     * Apply jquery auto complete on given element with given data as resource
     *
     * @param data: auto complete source
     * @param iElement: jquery object
     */
    var addAutocompleteToElement = function(data, iElement){
        iElement.autocomplete({
            source: data,
            minLength: 2,
            select: function() {
                $timeout(function() {
                    iElement.trigger('input');
                }, 0);
            }
        });
    };

    return function(scope, iElement) {
        stationService.getResource(function(data){
            addAutocompleteToElement(data, iElement)
        });
    };
});

app.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});




// Global (configuration) variables here.
app.run(function($rootScope) {
    $rootScope.iRailAPI = "http://api.irail.be";

    // parses iRail vehicle format
    // e.g. from be.NMBS.IR2000 to IR2000
    $rootScope.parseVehicleName = function(vehicle){
        return vehicle.split('.')[2];
    };
});
