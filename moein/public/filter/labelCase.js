angular.module('testApp').
filter('labelCase', function () {
    return function (value, reverse) {
        if (angular.isString(value)) {
            var intermediate = reverse ? value.toUpperCase() : value.toLowerCase();
            return (reverse ? intermediate[0].toLowerCase() : intermediate[0].toUpperCase()) + intermediate.subStr(1);
        } else {
            return value;
        }
        
    };
});