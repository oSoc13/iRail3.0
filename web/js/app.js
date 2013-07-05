// Copyright OKFN Belgium
// Author: Nik Torfs

var app = angular.module('iRail', []);

//App routes definition
app.config(['$routeProvider', function($routeProvider){
        $routeProvider.
            when('/', {templateUrl: 'views/directions.html', controller: DirectionsCtrl}).
            when('/route/:departureStation/:arrivalStation', {templateUrl: 'views/route.html', controller: RouteCtrl}).
            when('/train/:trainId', {templateUrl: 'views/train.html', controller: TrainCtrl}).
            when('/station', {templateUrl: 'views/station.html', controller: StationCtrl}).
            when('/station/:stationId', {templateUrl: 'views/station-realtime.html', controller: StationDetailCtrl}).
            otherwise({redirectTo: '/'});
    }]);


// Global (configuration) variables here.
app.run(function($rootScope) {
    $rootScope.iRailAPI = "http://api.irail.be";
});
