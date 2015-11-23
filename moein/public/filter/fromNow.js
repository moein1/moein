angular.module('productApp').
filter('fromNow', function () {
    return function (date) {
        return moment(date).fromNow();
    }
});