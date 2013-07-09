// Copyright OKFN Belgium
// Author: Nik Torfs

var app = angular.module('iRail', []);

//App routes definition
app.config(['$routeProvider', function($routeProvider){
        $routeProvider.
            when('/', {templateUrl: 'views/home.html', controller: DirectionsCtrl}).
            when('/route/:fromStation/:toStation/:dateString/:timeString/:timeSelection', {templateUrl: 'views/route.html', controller: RouteCtrl}).
            when('/train/:trainId', {templateUrl: 'views/train.html', controller: TrainCtrl}).
            when('/station/:stationName', {templateUrl: 'views/station-liveboard.html', controller: StationDetailCtrl}).
            otherwise({redirectTo: '/'});
    }]);

app.directive('autoComplete', function($timeout) {
    return function(scope, iElement, iAttrs) {
        setTimeout(function () {
            iElement.autocomplete({
                source: scope[iAttrs.uiItems]
            });
        }, 100);
    };
});

// Global (configuration) variables here.
app.run(function($rootScope) {
    $rootScope.iRailAPI = "http://api.irail.be";
});
