angular.module('productApp', ['ngRoute', 'wc.directives', 'ui.bootstrap', 'ngAnimate', 'ngMessages', 'ngCookies']).
config(['$locationProvider', '$routeProvider',
    function ($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.when('/product', {
            templateUrl: 'views/main.html',
            controller: 'productCtrl'
        }).when('/productEdit/:productId', {
            templateUrl: 'views/editProduct.html',
            controller: 'editProductCtrl'
        }).when('/login', {
            templateUrl: 'views/login.html',
            controller: 'loginController'
        }).when('/signup', {
            templateUrl: 'views/signup.html',
            controller: 'signupController'
        }).when('/forgotPassword', {
            templateUrl: 'views/forgetPassword.html',
            controller: 'forgetPasswordController'
        }).when('/resetPassword', {
            templateUrl: 'views/resetPassword.html',
            controller:'resetPasswordController'
        }).when('/', {
            templateUrl: 'views/profile.html',
            controller: 'profileController'
        }).when('/profile', {
            templateUrl: 'views/profile.html',
            controller: 'profileController'
        }).when('/uploadFile', {
            templateUrl: 'views/uploadImage.html',
            controller: 'uploadFileController'
        }).when('/uploadImage', {
            templateUrl: 'views/uploadImage.html'
        }).when('/chatting', {
            templateUrl: 'views/chatRoom.html',
            controller: 'chatController'
        }).otherwise({ reditrectTo: '/' });
    }]).config(['$httpProvider', function ($httpProvider) {
        //this intercepotrs can store some function related to the response or requeat in $http provider
        $httpProvider.interceptors.push(function ($rootScope, $window, $location, $q) {
            return {
                //I have assigned to the request property demonstrates how an interceptor can alter a request
                request: function (request) {
                    if ($window.localStorage.token) {
                        request.headers.authorization = 'Bears ' + $window.localStorage.token;
                    }
                    return request;
                },
                //this is test for seeing the result of activating this function
                /*response: function (response) {
                    console.log('Data count :' + response.data);
                    return response;
                },*/
                responseError: function (response) {
                    if (response.status == 401 || response.status == 403) {
                        $location.path('/login');
                    }
                    return $q.reject(response);
                }
            }
        });
    }]);