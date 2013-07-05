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
    $scope.arrivalStation = $routeParams.arrivalStation;
    $scope.departureStation = $routeParams.departureStation;
    $scope.routeDate = new Date();


    url = $rootScope.iRailAPI + "/connections/?format=json&to=" + $routeParams.arrivalStation + "&from=" + $routeParams.departureStation;

    //call  iRail api

    $http.get(url).success(function(data){
        $scope.possibleRoutes = parseVias(data.connection);
    });
}

function StationCtrl($scope){
}

function StationDetailCtrl($scope){

}

function TrainCtrl($scope){

}


//Changing the format of the returned json to something that is a bit more logical
function parseVias(connectionData){
    for(var i = 0; i < connectionData.length; i++){
        var connection = connectionData[i];
        var prevDirection = connection.arrival.direction;
        for(var j = connection.vias.via.length - 1; j >= 0; j--){
            var via = connection.vias.via[j];
            var tempDirection = via.direction;
            via.direction = prevDirection;
            prevDirection = tempDirection;            
        }
    }

    return connectionData;
}


//Use this when minifying

//DirectionsCtrl.$inject= ['$scope'];
//RouteCtrl.$inject= ['$scope', '$routeParams', '$http', '$rootScope'];
//StationCtrl.$inject= ['$scope'];
//StationDetailCtrl.$inject= ['$scope'];
//TrainCtrl.$inject= ['$scope'];