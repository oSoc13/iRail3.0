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
    var addAutocompleteToElement = function(data, iElement, scope){
        iElement.autocomplete({
            source: data,
            minLength: 2,
            select: function() {
                $timeout(function() {
                    iElement.trigger('input');
                    iElement.change();
                }, 0);
                scope.$apply();
            }
        });
    };

    return function(scope, iElement) {
        stationService.getResource(function(data){
            addAutocompleteToElement(data, iElement, scope)
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
// only usable for input fields (it triggers the input event, otherwise the scope variable doesn't get updated..)
app.directive('onEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                element.trigger("input");
                scope.$apply(function(){
                    scope.$eval(attrs.onEnter);
                });


            }
        });
    };
});