// Copyright OKFN Belgium
// Author: Nik Torfs

var MyRailCtrl = ['$scope', function($scope){
    // all static for the moment
    $scope.username = "John Doe";
    $scope.plannedRoutes = [{'from' : 'Bilzen', 'to': 'Antwerpen Berchem'},
        {'from' : 'Antwerpen Berchem', 'to': 'Bilzen'},
        {'from' : 'Gent', 'to': 'Oostende'}
    ];



}];