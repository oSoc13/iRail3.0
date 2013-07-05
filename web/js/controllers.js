// Copyright OKFN Belgium
// Author: Nik Torfs

// Controllers for each page of the app.
// The AngularJS injector will inject the requested parameters.
// The routes of the controllers are defined in app.js.
//
// If the javascript is to be minified, Uncomment the minifying code at the bottom of the file.

function DirectionsCtrl($scope, $location){
    $scope.departure = true;
    $scope.date = new Date();
    $scope.submit = function(){
        $location.path('/route/' + $scope.from + '/' + $scope.to);
    }
}

function RouteCtrl($scope, $routeParams, $http, $rootScope){
    $scope.arrivalStation = $routeParams.arrivalStation;
    $scope.departureStation = $routeParams.departureStation;
    $scope.routeDate = new Date();
    $scope.parseNbVias = parseNbVias;


    url = $rootScope.iRailAPI + "/connections/?format=json&to=" + $routeParams.arrivalStation + "&from=" + $routeParams.departureStation;

    //call  iRail api
    $http.get(url).success(function(data){
        $scope.possibleRoutes = parseConnectionData(data.connection);
    });
}

function StationCtrl($scope){
}

function StationDetailCtrl($scope){

}

function TrainCtrl($scope){

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

function parseNbVias(data){
    if(data){
        return parseInt(data.number)
    }
    return 0;
}


//Use this when minifying

//DirectionsCtrl.$inject= ['$scope', '$location'];
//RouteCtrl.$inject= ['$scope', '$routeParams', '$http', '$rootScope'];
//StationCtrl.$inject= ['$scope'];
//StationDetailCtrl.$inject= ['$scope'];
//TrainCtrl.$inject= ['$scope'];