angular.module('productApp').
controller('navController', ['$scope', 'authService', function ($scope, authService) {
    $scope.logout = function () {
        authService.logout();
    }
}]);