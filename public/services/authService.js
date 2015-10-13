angular.module('productApp').
factory('authService', ['$http', '$location', '$window', '$rootScope', 'alertingService', '$cookieStore',
function ($http, $location, $window, $rootScope, alertingService, $cookieStore) {
    var token = $window.localStorage.token;
    if (token) {
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        console.log('current user is ' + payload.user);
        
        $rootScope.currentUser = payload.user;
        var tempSrtatusArrays= $cookieStore.get('tempStatus');
        if (tempSrtatusArrays) {
            //adding new added status after login
            //because we do not want to reload the all the account informastion
            for (var i = 0; i < tempSrtatusArrays.length; i++) {
                $rootScope.currentUser.status.push(tempSrtatusArrays[i]);
                $rootScope.currentUser.activity.push(tempSrtatusArrays[i]);
            }
            
        }
    }
    return {
        login: function (user) {
            return $http.post('/api/login', user).
            success(function (data) {
                console.log('token is' + data.token);
                $window.localStorage.token = data.token;
                var payload = JSON.parse($window.atob(data.token.split('.')[1]));
                console.log(payload.user);
                $rootScope.currentUser = payload.user;
                //  $rootScope.currentUser = payload.user;
                $location.path('/');
                alertingService.startAlert('ok', 'You have loged in successfully');
            }).error(function (error) {
                alertingService.startAlert('error', error);
            });

        },
        signup: function (user) {
            return $http.post('/api/signup', user).
            success(function (data) {
                alertingService.startAlert('ok', 'You have signed up successfully');
                console.log(user);
                $location.path('/login');
            }).error(function (error) {
                alertingService.startAlert('error', 'Signed up error');
            });
        },
        logout: function () {
            return $http.get('/api/logout').
            success(function (data) {
                $rootScope.currentUser = '';
                $cookieStore.remove('tempStatus');
                delete $window.localStorage.token;
                $location.path('/');
                //$cookieStore.remove(user);
            });
        },
        forgetPassword: function (email) {
            //console.log(email);
            return $http.post('/api/forgetPassword', email).
            success(function (data) {
                console.log('You can go to your email address and reset your password');
                alertingService.startAlert('ok', 'You can go to your email address and reset your password');
            }).error(function (error) {
                console.log('some error occured during changing pasword');
                alertingService.startAlert('error', 'Some error occured during changing password proccess');
            });
        },
        resetPassword: function (ResetInfo) {
            return $http.post('/api/resetPassword', ResetInfo).
            success(function (data) {
                console.log('return data from server after chage password is:' + data.status);
                console.log('Your password has been changed successfully');
                alertingService.startAlert('ok', 'Your password changed successfully');
                $location.path('/login');
            }).error(function (error) {
                console.log('some error occured during reset password' + error);
                alertingService.startAlert('error', 'Some error iccured during changing password');
            });
        }
    }
}]);