// Copyright OKFN Belgium
// Author: Nik Torfs

/*
 * Directives for AngularJS
 */

app.directive('autoComplete', ['$timeout', 'stationService', function($timeout, stationService) {

    /*
     * Apply jquery auto complete on given element with given data as resource
     *
     * @param data: auto complete source
     * @param iElement: jquery object
     */
    var addAutocompleteToElement = function(data, iElement){
        iElement.autocomplete({
            source: data,
            minLength: 2,
            select: function() {
                $timeout(function() {
                    iElement.trigger('input');
                }, 0);
            }
        });
    };

    return function(scope, iElement) {
        stationService.getResource(function(data){
            addAutocompleteToElement(data, iElement)
        });
    };
}]);

app.directive('onFinishRender', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
}]);

// directive to catch enter button and use it
app.directive('onEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.onEnter);
                });

                event.preventDefault();
            }
        });
    };
});