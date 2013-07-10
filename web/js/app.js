// Copyright OKFN Belgium
// Author: Nik Torfs

var app = angular.module('iRail', ['ngResource']);

//App routes definition
app.config(['$routeProvider', function($routeProvider){
        $routeProvider.
            when('/', {templateUrl: 'views/home.html', controller: DirectionsCtrl}).
            when('/route/:fromStation/:toStation/:dateString/:timeString/:timeSelection', {templateUrl: 'views/route.html', controller: RouteCtrl}).
            when('/train/:trainId', {templateUrl: 'views/train.html', controller: TrainCtrl}).
            when('/station/:stationName', {templateUrl: 'views/station-liveboard.html', controller: StationDetailCtrl}).
            otherwise({redirectTo: '/'});
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

app.directive('autoComplete', function($timeout, stationService) {
    return function(scope, iElement) {
        stationService.getResource(function(data){
            iElement.autocomplete({
                source: data,
                minLength: 2,
                select: function() {
                    $timeout(function() {
                        iElement.trigger('input');
                    }, 0);
                }
            });
        });
    };
});

app.config(function($httpProvider){
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});
// Global (configuration) variables here.
app.run(function($rootScope) {
    $rootScope.iRailAPI = "http://api.irail.be";
});
