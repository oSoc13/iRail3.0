// Copyright OKFN Belgium
// Author: Nik Torfs

/*
 * The Stationcontroller handles all requests to '/station/:stationName' and renders the liveboard of that station
 */
function StationDetailCtrl($scope, $rootScope, $routeParams, $http, utilityService){
    $scope.stationName = $routeParams.stationName;

    url = $rootScope.iRailAPI + "/liveboard/?station=" + $scope.stationName + "&fast=true&format=json";

    //call  iRail api
    $http.get(url).success(function(data){
        $scope.liveboard = data.departures;
    });

    // running png fallback after ng repeat render
    $scope.$on('ngRepeatFinished', function() {
        utilityService.pngFallback();
    });
}

//Use this when minifying
StationDetailCtrl.$inject= ['$scope','$rootScope', '$routeParams', '$http', 'utilityService'];