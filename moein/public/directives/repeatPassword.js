angular.module('productApp').
directive('repeatPassword', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            var otherInput = element.inheritedData('$formController')[attrs.repeatPassword];
            //parsers is place to collect all the validity releatedc to ngModel controller
            ctrl.$parsers.push(function (value) {
               /* if (value == otherInput.$viewValue) {
                    ctrl.$setValidity('repeat', true);
                    return value;
                }
                ctrl.$setValidity('repeat', false);*/
                ctrl.$setValidity('repeat', value === otherInput.$viewValue);
                return value;
            }
            );

            otherInput.$parsers.push(function (value) {
                ctrl.$setValidity('repeat', value === ctrl.$viewValue);
                return value;
            });
        }
    }
});