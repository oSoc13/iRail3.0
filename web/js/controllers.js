// Copyright OKFN Belgium
// Author: Nik Torfs

function DirectionsCtrl($scope){
    $scope.departure = true;
    $scope.date = new Date();
}
//Use this when minifying
//DirectionsCtrl.$inject= ['$scope'];

function RouteCtrl($scope, $routeParams, $http, $rootScope){
    $scope.departureStation = $routeParams.departureStation;
    $scope.arrivalStation = $routeParams.arrivalStation;

    //call to irail api
    url = $rootScope.iRailAPI + "/connections/?format=json&to=" + $routeParams.arrivalStation + "&from=" + $routeParams.departureStation;
    $http.get(url).success(function(data){
        $scope.possibleRoutes = data.connection;
    });
}
//Use this when minifying
//RouteCtrl.$inject= ['$scope', '$routeParams', '$http', '$rootScope'];

function StationCtrl($scope){
}
//Use this when minifying
//RouteCtrl.$inject= ['$scope'];

function StationDetailCtrl($scope){

}
//Use this when minifying
//RouteCtrl.$inject= ['$scope'];