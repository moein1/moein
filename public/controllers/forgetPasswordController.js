angular.module('productApp').
controller('forgetPasswordController', ['$scope', 'authService',
    function ($scope, authService) {
        $scope.forgot = function () {
            authService.forgetPassword({ email: $scope.email });
        }
}]);

