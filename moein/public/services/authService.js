angular.module('productApp').
factory('authService', ['$http', '$location', '$window', '$rootScope', 'alertingService', '$cookieStore',
function ($http, $location, $window, $rootScope, alertingService, $cookieStore) {
    var token = $window.localStorage.token;
    if (token) {
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        
        $rootScope.currentUser = payload.user;
        
    }
    return {
        login: function (user) {
            return $http.post('/api/login', user).
            success(function (result) {
                $window.localStorage.token = result.token;

                var payload = JSON.parse($window.atob(result.token.split('.')[1]));
                $rootScope.currentUser = payload.user;
                $rootScope.currentProfile = result.currentProfile;
                $rootScope.desiredFriends = result.desireFriends;
                $rootScope.askedFriends = result.askedFriends;
                $rootScope.requestedFriends = result.recievedFriends;
                $rootScope.acceptFriends = result.acceptFriends;
                $rootScope.desiredFriendsClass = 'icon_plus';
                //adding current activity and state
                $rootScope.currentActivity = result.accountActivity;
                $rootScope.currentStatus = result.accountState;
                //$rootScope.currentProfile = result.currentProfile;

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
                alertingService.startAlert('ok', 'You can go to your email address and reset your password');
            }).error(function (error) {
                alertingService.startAlert('error', 'Some error occured during changing password proccess');
            });
        },
        resetPassword: function (ResetInfo) {
            return $http.post('/api/resetPassword', ResetInfo).
            success(function (data) {
                alertingService.startAlert('ok', 'Your password changed successfully');
                $location.path('/login');
            }).error(function (error) {
                console.log('some error occured during reset password' + error);
                alertingService.startAlert('error', 'Some error iccured during changing password');
            });
        }
    }
}]);