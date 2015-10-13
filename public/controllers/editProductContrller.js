angular.module('productApp').
controller('editProductCtrl', ['$scope', '$http', '$routeParams', 'productService', 'alertingService',
    '$location', 'modalService',
    function ($scope, $http, $routeParams, productService, alertingService, $location, modalService) {



        //we can recive the praemeter from ngRoute by using $routeParams service
        var productId = $routeParams.productId ? parseInt($routeParams.productId) : '';
        console.log('editong productid :' + productId);

        //we must try to catch the single product info from server or we xan catch through the $routeParams
        init();

        $scope.Currentproduct = {}

        $scope.Insert = function () {
            productService.insertProduct($scope.Currentproduct).then(function (result) {
                //the result contain the id of the product that just added to database
                console.log(result);
                if (result) {
                    alertingService.startAlert('ok', 'New product has been added succesfully');
                    console.log(result);
                    $scope.Currentproduct = {};
                } else {
                    //catch the error and alert the user for that
                    alertingService.startAlert('error', 'Deleting produt failed');
                }
            });
        }

        $scope.Update = function () {
            productService.updateProduct($scope.Currentproduct).then(function (result) {
                console.log('After editing : ' + result);
                if (result) {
                    alertingService.startAlert('ok', 'Product has been updated succssefuly');
                    $location.path('/');
                } else {
                    alertingService.startAlert('error', 'Updating product failed');
                }
            });
        }
        var modalOptions={
            closeButtonText:'Cancel',
            actionButtonText:'Leave Now',
            headerText:'Cancel Insert/Edit',
            bodyText:'Are you sure to cancel editing/updating product?'

        }
        $scope.cancel = function () {
            //showing modal for suring to cancel editing or updating product
            modalService.showModal({}, modalOptions).then(function (result) {
                if (result == 'ok') {
                    $scope.Currentproduct = {};
                    $location.path('/');
                }
            });
        }

        function init() {
            if (productId > 0) {
                $scope.insertMode = false;
                getSingleProduct(productId);
            } else {
                $scope.insertMode = true;
                $scope.Currentproduct = {};
            }

        }

        function getSingleProduct(id) {
            productService.getSingleProduct(id).then(function (product) {
                console.log('product is :' + product);
                $scope.Currentproduct = product;
            });
        }
    }]);