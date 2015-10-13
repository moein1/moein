angular.module('productApp').
controller('productCtrl', ['$scope', '$location', 'productService', 'alertingService', 'modalService',
    function ($scope, $location, productService, alertingService, modalService) {

        $scope.noProduct = ' There is no product';
        $scope.navigate = function (url) {
            $location.path(url);
        }
        $scope.listProduct = function () {
            getProducts();
        };

        $scope.addProduct = function (product) {
            $scope.products.push(product);
        }
        var modalOptions = {
            closeButtonText: 'Cancel',
            actionButtonText: 'Delete customer',
            headerText: 'Delete product?',
            bodyText: 'Are you sure to delete this product'

        };

        $scope.deleteProduct = function (product) {
           //console.log('deletring product :' + product.id);
            //adding modal  in this place
            //this use modapotions for deleting product
            modalService.showModal({}, modalOptions).then(function (modalresult) {
                if (modalresult == 'ok') {
                    productService.deleteProduct(product.id).then(function (result) {
                        console.log('Delete produt result :' + result);
                        if (result) {
                            //if the product has been delted sucess from database you must cut it down from array of $scope.product manuly
                            //but in any refresgh of data this change can been seen in output
                            //invoke self created alert service

                            alertingService.startAlert('ok', 'Selected product has been deleted successfully');
                            produc_index = $scope.products.indexOf(product);
                            $scope.products.splice(produc_index, 1);


                        } else {
                            alertingService.startAlert('error', 'deleting product failed');
                        }
                    });
                }
            });
        }

        $scope.EditProduct = function (product) {
            console.log('editing product:' + product.id);
            $location.path('/productEdit/' + product.id);
        }
        //ordering product
        $scope.reverse = -1;
        $scope.orderby = 'name';
        $scope.setOrder = function (orderby) {
            if ($scope.orderby == orderby) {
                $scope.reverse = -$scope.reverse;
            }
            $scope.orderby = orderby;
            pageIndex = 0;
            $scope.selectedPage = 1;
            getLimitProduct();
        }

        //for limiting the getProducts we must use top productPerPage var
        //we must transfer this parameyet to the server through queystring
        var pageIndex = 0,
        productPerPage = 4,
        totalRecords = 0;
        $scope.pages = [];
        $scope.selectedPage = 1;
        
       
        $scope.selectedPageClass = 'btn-default';

        $scope.selectPage = function (page) {
            $scope.selectedPage = page;
            pageIndex = page - 1;
            getLimitProduct();
        }

        function getLimitProduct() {
            productService.getLimitProduct(pageIndex, productPerPage,$scope.orderby,$scope.reverse).then(function (result) {
                if (result) {
                    console.log('data are : '+result.data);
                    $scope.products = result.data;
                    totalRecords = result.count;
                    $scope.pages = [];
                    $scope.pageCount = Math.ceil(totalRecords / productPerPage)
                    //console.log('page no :' + $scope.selectedPage);
                    //console.log('page count is :' + totalRecords + ' / ' + productPerPage + ' = ' + $scope.pageCount);
                    for (var i = 0; i < $scope.pageCount ; i++) {
                        $scope.pages.push(i + 1);
                    }
                }
            });
        }
        
        function getProducts() {
            
            productService.getProducts().then(function (result) {
                //console.log('product result is ' + result);
                if (result) $scope.products = result;
            });
        }

        getLimitProduct();
        //getProducts();
    }]);