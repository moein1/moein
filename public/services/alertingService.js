angular.module('productApp').
factory('alertingService', ['$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        return {
            startAlert: function (type,message) {
                $rootScope.alertClass = type == 'ok' ? 'label-success' : 'label-danger';
                $rootScope.alertMesage = message;
                $rootScope.alertStatus = true;
                startTimer();
            }
        }
        function startTimer() {
            timer = $timeout(function () {
                $timeout.cancel(timer);
                $rootScope.alertStatus = false;
            },3000);
        }
}]);