// Copyright OKFN Belgium
// Author: Nik Torfs

// Controllers for each page of the app.
// The AngularJS injector will inject the requested parameters.
// The routes of the controllers are defined in app.js.
//
// If the javascript is to be minified, Uncomment the minifying code at the bottom of the file.


// [/]
function DirectionsCtrl($scope, $location, $rootScope, $http){
    var date = new Date();
    $scope.day = date.getDate();
    $scope.month = date.getMonth() + 1; //human readable
    $scope.year = date.getFullYear();
    $scope.hours = date.getHours();
    $scope.minutes = date.getMinutes();

    var url = $rootScope.iRailAPI + "/stations/?lang=en&format=json";
    $http.get(url).success(function(data){
        $scope.stations = parseStationData(data.station);
    });

    $scope.switchFromTo = function(){
        var temp = $scope.from;
        $scope.from = $scope.to;
        $scope.to = temp;
    }

    $scope.searchDirections = function(){
        var dayString = addLeadingZeroIfNeeded($scope.day);
        var monthString = addLeadingZeroIfNeeded($scope.month);
        var yearString = $scope.year.toString().substr(2);
        var hourString = addLeadingZeroIfNeeded($scope.hours);
        var minuteString = addLeadingZeroIfNeeded($scope.minutes);

        $location.path('/route/' +
            $scope.from + '/' +
            $scope.to + '/' +
            dayString + monthString + yearString + '/' +
            hourString + minuteString + '/' +
            $scope.departure
        );
    }

    $scope.searchStations = function(){
        $location.path('/station/' + $scope.station);
    }

}

// [/route/:fromStation/:toStation]
function RouteCtrl($scope, $routeParams, $http, $rootScope){
    $scope.toStation = $routeParams.toStation;
    $scope.fromStation = $routeParams.fromStation;
    $scope.routeDate = new Date();

    console.log($routeParams);

    $scope.parseNbVias = function(vias){
        if(vias){
            return parseInt(vias.number)
        }
        return 0;
    };


    url = $rootScope.iRailAPI + "/connections/?to=" + $routeParams.toStation +
        "&from=" + $routeParams.fromStation +
        "&date=" + $routeParams.dateString +
        "&time=" + $routeParams.timeString +
        "&timeSel=" + $routeParams.timeSelection +
        "&format=json";

    console.log(url);
        //call  iRail api
    $http.get(url).success(function(data){
        $scope.possibleRoutes = parseConnectionData(data.connection);
    });
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

//parse the station json to an array of stationNames
function parseStationData(stationData){
    var stationNames = [];
    for(var i = 0; i<stationData.length; i++){
        var station = stationData[i];
        stationNames.push(station.name)
    }
    return stationNames;
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

function addLeadingZeroIfNeeded(data){
    if(data < 10){
        return "0" + data.toString();
    }

    return data.toString();
}

//Use this when minifying

//DirectionsCtrl.$inject= ['$scope', '$location', '$rootScope', '$http'];
//RouteCtrl.$inject= ['$scope', '$routeParams', '$http', '$rootScope'];
//StationCtrl.$inject= ['$scope', '$location'];
//StationDetailCtrl.$inject= ['$scope','$rootScope', '$routeParams', '$http'];
//TrainCtrl.$inject= ['$scope', '$routeParams', '$http', '$rootScope'];