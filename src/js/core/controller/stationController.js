// Copyright OKFN Belgium
// Author: Nik Torfs

/*
 * The Stationcontroller handles all requests to '/station/:stationName' and renders the liveboard of that station
 */
var StationDetailCtrl = ['$scope','$rootScope', '$routeParams', '$http', 'utilityService', function StationDetailCtrl($scope, $rootScope, $routeParams, $http, utilityService){
    $scope.stationName = $routeParams.stationName;
    $rootScope.hasBackbutton = true;

    url = $rootScope.iRailAPI + "/liveboard/?station=" + $scope.stationName + "&fast=true&format=json";

    //call  iRail api
    $http.get(url).success(function(data){
        $scope.liveboard = data.departures;
    });

    // running png fallback after ng repeat render
    $scope.$on('ngRepeatFinished', function() {
        utilityService.pngFallback();
    });
}];