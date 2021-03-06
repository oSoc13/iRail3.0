// Copyright OKFN Belgium
// Author: Nik Torfs


/*
 * The route controller, it handles all requests to '/route/:fromStation/:toStation/:date/:time/:timeselection'
 * with
 *      :fromStation -> the departure station
 *      :toStation -> the arrival station
 *      :date -> the date with leading zeroes and the first two digits of the year truncated (e.g.: 010613 for 01/06/2013)
 *      :time -> the time in 24h format with leading zeroes
 *      :timeSelection -> 'arrive' or 'depart'
 */
var RouteCtrl = [
    '$scope',
    '$routeParams',
    '$http',
    '$rootScope',
    '$location',
    'utilityService',
    'favoriteRouteService' ,
    'historyService',
    'geolocationService',
    function ($scope,
              $routeParams,
              $http,
              $rootScope,
              $location,
              utilityService,
              favoriteRouteService,
              historyService,
              geolocationService){

        $scope.toStation = $routeParams.toStation;
        $scope.fromStation = $routeParams.fromStation;

        $rootScope.hasBackbutton = true;

        // maybe divide into two routes instead of checking which params are filled in //todo
        if($routeParams.dateString){
            var day = parseInt($routeParams.dateString.substring(0, 2));
            var month = parseInt($routeParams.dateString.substring(2,4));
            var year = parseInt("20" + $routeParams.dateString.substring(4,6));
            $scope.routeDate = new Date(year, month - 1, day);
            $scope.date = $routeParams.dateString;
            $scope.time = $routeParams.timeString;
            $scope.timesel = $routeParams.timeSelection;
        }else{
            $scope.routeDate = new Date();
            $scope.date = utilityService.getIrailDateString($scope.routeDate);
            $scope.time = utilityService.getIrailTimeString($scope.routeDate);
            $scope.timesel = "depart"
        }

        if($routeParams.selectedRoute){
            $scope.lastRouteOpened = ($routeParams.selectedRoute == "last");
        }

        // utility function to parse the vias to int so that math can be used in the view
        $scope.parseNbVias = function(vias){
            if(vias){
                return parseInt(vias.number)
            }
            return 0;
        };

        //save this route to the history
        saveToHistory();
        //update neural net
        updatePrefill();

        var url = $rootScope.iRailAPI + "/connections/?to=" + $routeParams.toStation +
            "&from=" + $routeParams.fromStation +
            "&date=" + $scope.date +
            "&time=" + $scope.time +
            "&timeSel=" + $scope.timesel +
            "&format=json";

        //HTTP GET to the iRail api
        $http.get(url).success(function(data){
            // adding the returned routes to the scope (angular will fill them in for us)
            $scope.possibleRoutes = parseConnectionData(data.connection);
        });

        //opening the collapsible list (should be refactored to a directive [TODO])
        $scope.open = function($event){
            var button = $(".list-head__collapse-btn", $event.currentTarget);

            // we don't want to open an already opened route
            if(button.hasClass("opened")){
                return;
            }

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

            button.removeClass("closed");
            button.addClass("opened");
        };


        // get earlier routes
        $scope.earlier = function(){
            var dateString = utilityService.getIrailDateString($scope.routeDate);
            var firstArrive = new Date($scope.possibleRoutes[0].arrival.time*1000);
            var timeString = utilityService.getIrailTimeString(firstArrive);
            $scope.lastRouteOpened = false;
            changeLookupDate(dateString, timeString, "arrive");
        };

        // get later routes
        $scope.later = function(){
            var lastDeparture = new Date($scope.possibleRoutes[$scope.possibleRoutes.length - 1].departure.time*1000);
            var dateString = utilityService.getIrailDateString(lastDeparture);
            var timeString = utilityService.getIrailTimeString(lastDeparture);
            $scope.lastRouteOpened = false;
            changeLookupDate(dateString, timeString, "depart");
        };

        // get earliest routes
        $scope.earliest = function(){
            var dateString = utilityService.getIrailDateString($scope.routeDate);
            $scope.lastRouteOpened = false;
            changeLookupDate(dateString, "0300", "depart");
        };

        // get latest routes
        $scope.latest = function(){
            var nextDay = new Date($scope.routeDate);
            nextDay.setDate(nextDay.getDate() + 1);
            var dateString = utilityService.getIrailDateString(nextDay);
            $scope.lastRouteOpened = true;
            changeLookupDate(dateString, "0300", "arrive");
        };

        // running png fallback after ng repeat render
        $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
            utilityService.pngFallback();
        });

        // add the route to favorites
        $scope.favorite = function(){
            favoriteRouteService.addFavorite($scope.fromStation, $scope.toStation);
        };

        // Remove the route from the favorites
        $scope.unfavorite = function(){
            favoriteRouteService.removeFavorite($scope.fromStation, $scope.toStation);
        };

        // check if a route is favorited or not
        $scope.alreadyFavorited = function(){
            return favoriteRouteService.exists($scope.fromStation, $scope.toStation);
        };

        // Changing the format of the returned json to something that is a bit more logical
        // (the departure direction in the via instead of the arrival direction)
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


        // utility function to change the route lookup parameters and redo the request to the iRail api
        function changeLookupDate(dateString, timeString, timeSelect){
            var url = '/route/' +
                $scope.fromStation + '/' +
                $scope.toStation + '/' +
                dateString + '/' +
                timeString + '/' +
                timeSelect;

            if($scope.lastRouteOpened){
                url += '/last'
            }

            // changing the url
            $location.path(url);
        }



        $scope.reverseTrip = function(){
            //todo keep selected route index in a variable
            //find selected route
            var route = null;
            var buttons = angular.element.find(".list-head__collapse-btn");
            for(var i = 0; i < buttons.length; i++){
                var currentButton = buttons[i];
                if($(currentButton).hasClass("opened")){
                    route = $scope.possibleRoutes[i]
                    break;
                }
            }

            var date = new Date(route.arrival.time * 1000);
            var departure_date = utilityService.getIrailDateString(date);
            var departure_time = utilityService.getIrailTimeString(date);

            var url = '/route/' +
                route.arrival.station + '/' +
                route.departure.station + '/' +
                departure_date + '/' +
                departure_time + '/' +
                "depart";


            $location.path(url);
        };

        function saveToHistory(){
            var timestamp = new Date();

            geolocationService.getCurrentPosition(function(position){
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;

                historyService.add(timestamp, $scope.fromStation, $scope.toStation, latitude, longitude);
            }, {enableHighAccuracy:false});
        }

        function updatePrefill(){
            var history = historyService.get();

            if(history == null || !(history.length == 0)){
                var prefill = new Prefill();
                prefill.prepare(historyService.get(), function(){
                    $rootScope.prefill = prefill;
                })
            }
        }

    }];