angular.module('productApp')
.controller('signupController', ['$scope', 'authService',
    function ($scope, authService) {
        $scope.signup = function () {
            authService.signup({
                name: $scope.displayName,
                email: $scope.email,
                password: $scope.password,
                firstName: $scope.firstName,
                lastName: $scope.lastName,
                country: $scope.country,
                occupation: $scope.occupation
            });
        };
}]);