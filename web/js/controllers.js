// Copyright OKFN Belgium
// Author: Nik Torfs

// Controllers for each page of the app.
// The AngularJS injector will inject the requested parameters.
// The routes of the controllers are defined in app.js.
//
// If the javascript is to be minified, Uncomment the minifying code at the bottom of the file.

function DirectionsCtrl($scope){
    $scope.departure = true;
    $scope.date = new Date();
}

function RouteCtrl($scope, $routeParams, $http, $rootScope){
    $scope.departureStation = $routeParams.departureStation;
    $scope.arrivalStation = $routeParams.arrivalStation;

    //call to irail api
    url = $rootScope.iRailAPI + "/connections/?format=json&to=" + $routeParams.arrivalStation + "&from=" + $routeParams.departureStation;
    $http.get(url).success(function(data){
        $scope.possibleRoutes = data.connection;
    });
}

function StationCtrl($scope){
}

function StationDetailCtrl($scope){

}

function TrainCtrl($scope){

}


//Use this when minifying

//DirectionsCtrl.$inject= ['$scope'];
//RouteCtrl.$inject= ['$scope', '$routeParams', '$http', '$rootScope'];
//StationCtrl.$inject= ['$scope'];
//StationDetailCtrl.$inject= ['$scope'];
//TrainCtrl.$inject= ['$scope'];