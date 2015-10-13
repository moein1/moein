angular.module('productApp').
controller('resetPasswordController', ['$scope', '$location', 'authService', function ($scope, $location, authService) {
    //retrive account from query string and the we can try to get the old password and new password from 
    //and change password
    console.log('query string from ult is :' + $location.search().account);

    $scope.ResetPass = function () {
        authService.resetPassword({ newPassword: $scope.password, accountId: $location.search().account });
    }
}]);