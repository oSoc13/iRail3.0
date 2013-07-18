// Copyright OKFN Belgium
// Author: Nik Torfs

/*
 * The Traincontroller handles requests to '/train/:trainId' and puts the relevant data to that train in its scope
 * with
 *      :trainId the train name following the iRail convention (e.g.: BE.NMBS.IR2000)
 */
function TrainCtrl($scope, $routeParams, $http, $rootScope, utilityService){
    $scope.trainNumber = $routeParams.trainId;//todo regex to get only the number

    var url = $rootScope.iRailAPI + "/vehicle/?id=" + $routeParams.trainId + "&fast=true&format=json";

    //call  iRail api
    $http.get(url).success(function(data){
        $scope.stops = data.stops;
    });

    // running png fallback after ng repeat render
    $scope.$on('ngRepeatFinished', function() {
        utilityService.pngFallback();
    });
}

// manual injection for minification
TrainCtrl.$inject= ['$scope', '$routeParams', '$http', '$rootScope', 'utilityService'];
