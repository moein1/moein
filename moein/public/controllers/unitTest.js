angular.module('testApp').
    constant('baseUrl', '/api/dataService/').
controller('unitTestController', ['$scope', '$http', 'baseUrl', '$interval', '$timeout','$log',
    function ($scope, $http, baseUrl, $interval, $timeout,$log) {
        $scope.counter = 0;
        $scope.intervalCounter = 0;
        $scope.timerCounter = 0;

        //this function will be executred with 5 second
        //and repeat each 10s
        $interval(function () {
            $scope.intervalCounter++;
        }, 5000, 10);

        $timeout(function () {
            $scope.timerCounter++;
        }, 5000);
        $scope.increment = function () {
            console.log('increment');
            $scope.counter++;
        }

        $http.get(baseUrl + 'products').success(function (data) {
            console.log('opuput data are ' + data);
            $log.log('data count is' + data.length + 'items');
            $scope.products = data;
        });

    }]);