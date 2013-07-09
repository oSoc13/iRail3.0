// Copyright OKFN Belgium
// Author: Nik Torfs

// Controllers for each page of the app.
// The AngularJS injector will inject the requested parameters.
// The routes of the controllers are defined in app.js.
//
// If the javascript is to be minified, Uncomment the minifying code at the bottom of the file.


// [/]
function DirectionsCtrl($scope, $location){
    //initializing scope
    $scope.departure = true;
    var date = new Date();
    $scope.day = date.getDate() - 1;
    $scope.month = date.getMonth();
    $scope.year = date.getYear();
    $scope.hour = date.getHours();
    $scope.minutes = date.getMinutes();


    $scope.submit = function(){
        $location.path('/route/' + $scope.from + '/' + $scope.to);
    }


}

// [/route/:fromStation/:toStation]
function RouteCtrl($scope, $routeParams, $http, $rootScope){
    $scope.toStation = $routeParams.toStation;
    $scope.fromStation = $routeParams.fromStation;
    $scope.routeDate = new Date();


    $scope.parseNbVias = function(vias){
        if(vias){
            return parseInt(vias.number)
        }
        return 0;
    };


    url = $rootScope.iRailAPI + "/connections/?to=" + $routeParams.toStation + "&from=" + $routeParams.fromStation + "&format=json";

    //call  iRail api
    $http.get(url).success(function(data){
        $scope.possibleRoutes = parseConnectionData(data.connection);
    });
}

// [/station]
function StationCtrl($scope, $location){
    $scope.submit = function(){
        $location.path('/station/' + $scope.station);
    }
}

// [/station/:stationName]
function StationDetailCtrl($scope, $rootScope, $routeParams, $http){
    $scope.stationName = $routeParams.stationName;

    url = $rootScope.iRailAPI + "/liveboard/?station=" + $scope.stationName + "&fast=true&format=json";

    //call  iRail api
    $http.get(url).success(function(data){
        $scope.liveboard = data.departures;
    });
}

// [/train/:trainId]
function TrainCtrl($scope, $routeParams, $http, $rootScope){
    $scope.trainNumber = $routeParams.trainId;//todo regex to get only the number

    url = $rootScope.iRailAPI + "/vehicle/?id=" + $routeParams.trainId + "&fast=true&format=json";

    //call  iRail api
    $http.get(url).success(function(data){
        $scope.stops = data.stops;
    });
}


//Changing the format of the returned json to something that is a bit more logical
function parseConnectionData(connectionData){
    for(var i = 0; i < connectionData.length; i++){
        var connection = connectionData[i];
        var prevDirection = connection.arrival.direction;
        if(!connection.vias){
            continue;
        }
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

//DirectionsCtrl.$inject= ['$scope', '$location'];
//RouteCtrl.$inject= ['$scope', '$routeParams', '$http', '$rootScope'];
//StationCtrl.$inject= ['$scope', '$location'];
//StationDetailCtrl.$inject= ['$scope','$rootScope', '$routeParams', '$http'];
//TrainCtrl.$inject= ['$scope', '$routeParams', '$http', '$rootScope'];