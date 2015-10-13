angular.module('productApp')
.controller('loginController', ['$scope', 'authService',
    function ($scope, authService) {
        $scope.login = function () {
            authService.login({
                email: $scope.email,
                password: $scope.password
            });
        };
}]);