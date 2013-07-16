// Copyright OKFN Belgium
// Author: Nik Torfs

// Controllers for each page of the app.
// The AngularJS injector will inject the requested parameters.
// The routes of the controllers are defined in app.js.
//
// If the javascript is to be minified, Uncomment the minifying code at the bottom of the file.


// [/]
function DirectionsCtrl($scope, $location){
    var date = new Date();
    $scope.day = date.getDate();
    $scope.month = date.getMonth() + 1; //human readable
    $scope.year = date.getFullYear();
    $scope.hours = date.getHours();
    $scope.minutes = date.getMinutes();
    $scope.departure = "depart";

    $scope.switchFromTo = function(){
        var temp = $scope.from;
        $scope.from = $scope.to;
        $scope.to = temp;
    };

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
    };

    $scope.searchStations = function(){
        $location.path('/station/' + $scope.station);
    };

    //Tab bar functionality
    //todo refactor to its own controller
    $scope.directions = function(){
        $("#directions").addClass("active");
        $("#stations").removeClass("active");
        $("#myrail").removeClass("active");
    };

    $scope.stations = function (){
        $("#directions").removeClass("active");
        $("#stations").addClass("active");
        $("#myrail").removeClass("active");
    };

    $scope.myRail = function (){
        $("#directions").removeClass("active");
        $("#stations").removeClass("active");
        $("#myrail").addClass("active");
    };

}

// [/route/:fromStation/:toStation]
function RouteCtrl($scope, $routeParams, $http, $rootScope, $location){
    $scope.toStation = $routeParams.toStation;
    $scope.fromStation = $routeParams.fromStation;
    $scope.routeDate = new Date();
    $scope.date = $routeParams.dateString;

    $scope.parseNbVias = function(vias){
        if(vias){
            return parseInt(vias.number)
        }
        return 0;
    };

    var url = $rootScope.iRailAPI + "/connections/?to=" + $routeParams.toStation +
        "&from=" + $routeParams.fromStation +
        "&date=" + $scope.date +
        "&time=" + $routeParams.timeString +
        "&timeSel=" + $routeParams.timeSelection +
        "&format=json";

    //call  iRail api
    $http.get(url).success(function(data){
        $scope.possibleRoutes = parseConnectionData(data.connection);
    });

    //opening a collapse list
    $scope.open = function($event){
        var details = angular.element.find(".list-detail");
        for(var i = 0; i < details.length; i++){
            var currentDetail = details[i];
            $(currentDetail).hide(500);
        }

        var buttons = angular.element.find(".list-head__collapse-btn");
        for(var i = 0; i < buttons.length; i++){
            var currentButton = buttons[i];
            $(currentButton).removeClass("opened");
            $(currentButton).addClass("closed");
        }

        var element = $(".list-detail", $event.currentTarget);
        element.show(500);

        var button = $(".list-head__collapse-btn", $event.currentTarget);
        button.removeClass("closed");
        button.addClass("opened");
    };

    $scope.earlier = function(){
        var firstArrive = new Date($scope.possibleRoutes[0].arrival.time*1000);
        var firstArriveTime = (firstArrive.getHours()<10?'0':'') + firstArrive.getHours()+(firstArrive.getMinutes()<10?'0':'') + firstArrive.getMinutes();

        $location.path('/route/' +
            $scope.fromStation + '/' +
            $scope.toStation + '/' +
            $scope.date + '/' +
            firstArriveTime + '/' +
            "arrive"
        );
    };

    $scope.later = function(){
        var lastDeparture = new Date($scope.possibleRoutes[$scope.possibleRoutes.length - 1].departure.time*1000);
        var lastDepartureTime = addLeadingZeroIfNeeded(lastDeparture.getHours()) + addLeadingZeroIfNeeded(lastDeparture.getMinutes());

        $location.path('/route/' +
            $scope.fromStation + '/' +
            $scope.toStation + '/' +
            $scope.date + '/' +
            lastDepartureTime + '/' +
            "depart"
        );
    };

    // running png fallback after ng repeat render
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        pngFallback();
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

    // running png fallback after ng repeat render
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        pngFallback();
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

    // running png fallback after ng repeat render
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        pngFallback();
    });
}


//dirty way to change svg to png if not supported (can't happen on page load because angular loads some stuff dynamically)
function pngFallback(){
    if (!Modernizr.svg) {
        // wrap this in a closure to not expose any conflicts
        (function() {
            // grab all images. getElementsByTagName works with IE5.5 and up
            var imgs = document.getElementsByTagName('img'),endsWithDotSvg = /.*\.svg$/,i = 0,l = imgs.length;
            // quick for loop
            for(; i < l; ++i) {
                if(imgs[i].src.match(endsWithDotSvg)) {
                    // replace the png suffix with the svg one
                    imgs[i].src = imgs[i].src.slice(0, -3) + 'png';
                }
            }
        })();
    }
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

DirectionsCtrl.$inject= ['$scope', '$location'];
RouteCtrl.$inject= ['$scope', '$routeParams', '$http', '$rootScope', '$location'];
StationDetailCtrl.$inject= ['$scope','$rootScope', '$routeParams', '$http'];
TrainCtrl.$inject= ['$scope', '$routeParams', '$http', '$rootScope'];