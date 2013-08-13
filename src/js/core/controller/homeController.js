// Copyright OKFN Belgium
// Author: Nik Torfs

/*
 * The controller for the homepage, it handles the requests to the '/' route
 */
var DirectionsCtrl = ['$scope', '$location', 'utilityService', function($scope, $location, utilityService){
    var date = new Date();

    // scope variable definition and initialization
    // (so that angular fills in some nice default values in the page)
    $scope.day = date.getDate();
    $scope.month = date.getMonth() + 1;
    $scope.year = date.getFullYear();
    $scope.hours = date.getHours();
    $scope.minutes = date.getMinutes();
    $scope.departure = "depart";

    // switch 'from' and 'to'
    $scope.switchFromTo = function(){
        var temp = $scope.from;
        $scope.from = $scope.to;
        $scope.to = temp;
    };

    // redirects the user to the route page where the requested routes will be showed
    $scope.searchDirections = function(){
        var dayString = utilityService.addLeadingZeroIfNeeded($scope.day);
        var monthString = utilityService.addLeadingZeroIfNeeded($scope.month);
        var yearString = $scope.year.toString().substr(2);
        var hourString = utilityService.addLeadingZeroIfNeeded($scope.hours);
        var minuteString = utilityService.addLeadingZeroIfNeeded($scope.minutes);

        $location.path('/route/' +
            $scope.from + '/' +
            $scope.to + '/' +
            dayString + monthString + yearString + '/' +
            hourString + minuteString + '/' +
            $scope.departure
        );
    };

    // redirects the uer to the stations page where all current departures in the specified station are showed
    $scope.searchStations = function(){
        $location.path('/station/' + $scope.station);
    };

    $scope.focus = function(nextElementId, valid){
        if(valid){

            $("#" + nextElementId).focus();
        }
    };

    //Tab bar functionality
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
}];