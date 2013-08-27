// Copyright OKFN Belgium
// Author: Nik Torfs

var app = angular.module('iRail', ['ngResource', 'LocalStorageModule']);

//App routes definition
app.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider){
        $routeProvider.
            when('/', {templateUrl: 'views/home.html', controller: DirectionsCtrl}).
            when('/route/:fromStation/:toStation', {templateUrl:'views/route.html', controller: RouteCtrl}).
            when('/route/:fromStation/:toStation/:dateString/:timeString/:timeSelection', {templateUrl: 'views/route.html', controller: RouteCtrl}).
            when('/route/:fromStation/:toStation/:dateString/:timeString/:timeSelection/:selectedRoute', {templateUrl: 'views/route.html', controller: RouteCtrl}).
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

app.factory('httpInterceptor', ['$q', function ($q) {
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
}]);


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
        return out;
    };
});

// Global (configuration) variables here.
app.run(['$rootScope', 'historyService', function($rootScope, historyService) {
    $rootScope.iRailAPI = "http://api.irail.be";

    // parses iRail vehicle format
    // e.g. from be.NMBS.IR2000 to IR2000
    $rootScope.parseVehicleName = function(vehicle){
        return vehicle.split('.')[2];
    };

    $rootScope.back = function(){
        history.back();
    };

    //prefill global so that we don't train the data every time a controller is loaded
    var prefill = new Prefill();
    prefill.prepare(historyService.get(), function(){
        $rootScope.prefill = prefill;
    })
}]);
