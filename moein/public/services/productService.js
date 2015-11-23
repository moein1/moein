angular.module('productApp').
    constant('baseUrl', '/api/dataService/').
factory('productService', ['$http', 'baseUrl', function ($http, baseUrl) {

    return {
        getProducts: function () {
            return $http.get(baseUrl + 'products').then(function (result) {
               // console.log(result.data);
                return result.data;
            });
        },
        getLimitProduct: function (pageIndex, productPerPage,orderby,reverse) {
            //pageindex is page no minus 1
            var skip = pageIndex * productPerPage;
            var top = productPerPage;
            return $http.get(baseUrl + 'GetLimitProducts?$skip=' + skip +
                '&$top=' + top + '&$orderby=' + orderby + '&$reverse=' + reverse).then(
                function (response) {
                    return {
                        count: parseInt(response.headers('X-InlineCount')),
                        data: response.data
                    }
                });
            
        },
        getSingleProduct:function(id)
        {
            return $http.get(baseUrl + 'GetProduct/' + id).then(function (result) {
                return result.data.product;
            });
        },
        insertProduct: function (product) {
            return $http.post(baseUrl + 'PostProduct', product).then(
                function (result) {
                    console.log('the id of new inseted product is :' + result.data.id);
                    return result.data.id;
            });
                
        },
        updateProduct:function(product)
        {
            return $http.put(baseUrl + 'PutProduct/' + product.id, product).then(
                function (result) {
                    console.log('updating has been done : ' + result);
                    return result.data.status;
                });
        },
        deleteProduct: function (id) {
            //console.log('deleting in product service stage' + id);
            return $http.delete(baseUrl + 'DeleteProduct/' + id).then(
                function (result) {
                    //we recive a lot of information from server that the main part must be searched in data 
                    //console.log('just return to client side we status stat if : ' + status.data);
                    //in this example data is a json object that contain only status object that
                    //indicate the reslut of deleting the product if true the spcific product has been delleted from database

                    return result.data.status;
                });
        }
    }
}]);