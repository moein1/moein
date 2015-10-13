angular.module('productApp').
constant('ProfilebaseUrl', '/api/Profile/').
factory('profileService', ['$http', 'ProfilebaseUrl', '$rootScope', '$window',
    function ($http, ProfilebaseUrl, $rootScope, $window) {
        return {
            //update profile
            updateProfile: function (profile) {
                return $http.put(ProfilebaseUrl + 'updateProfile/' + profile._id, profile).success(
                    function (data) {
                        if (data) {
                            console.log('token is : ' + data.token);
                            //we must update the token that handle curent user
                            //the account and user are the same and must be keep sync during all update
                            $window.localStorage.token = data.token;
                            //var payload = JSON.parse($window.atob(data.token.split('.')[1]));
                            return true;
                        }

                    });
            },
            //adding new status to cuurentuser
            addStatus: function (status, accountId) {
                return $http.put(ProfilebaseUrl + 'addStatus/' + accountId, status).then(
                    function (response) {
                        console.log('reciv token in aftrer add status is :' + response.data);
                        /*first approch recieve all the account info from server
                        $window.localStorage.token = data.token;
                        var payload = JSON.parse($window.atob(data.token.split('.')[1]));
                        console.log('new payload user is :' + payload.user);
                        $rootScope.currentUser = payload.user;*/
                        return {
                            activities: response.data.activities,
                            status: response.data.status
                        };
                    });
            },
            //getting desired friend list
            getDesiredFriends: function (accountId) {
                return $http.get(ProfilebaseUrl + 'getDesiredFriends/' + accountId).then(
                    function (response) {
                        if (response) {
                            console.log(response.data);
                            return {
                                desiredFriends: response.data.desiredFriends,
                                askedFriends: response.data.askedFriends,
                                recievedFriends: response.data.recievedFriends,
                                acceptFriends: response.data.acceptFriends,
                                accountActivity: response.data.accountActivity,
                                accountState: response.data.accountState
                            };
                        }
                    });

            },
            //send friend request
            SendFriendRequest: function (accountId, contactId) {
                return $http.put(ProfilebaseUrl + 'sendFriendRequest/' + accountId, { contactId: contactId }).
                    success(
                    function (response) {
                        console.log('asked friend siccessfully ' + response.status);
                        return true;
                    });
            },
            //accept friend request
            AcceptFriend: function (accountId, contactId) {
                return $http.put(ProfilebaseUrl + 'acceptFriend/' + accountId, { contactId: contactId }).
                success(function (response) {
                    console.log('Accpet friend request successfully ');
                    return true;
                });
            },
            //share status
            shareStatus: function (accountId, status) {
                console.log('status is:' + status);
                return $http.put(ProfilebaseUrl + 'shareStatus/' + accountId, status).
                success(function (response) {
                    console.log('your status shared successfully');
                    return true;
                });
            },
            //add comment
            addCommnet: function (statusId, originAccountId,comment) {
                return $http.put(ProfilebaseUrl + 'addCommnet/' + originAccountId, { statusId: statusId, comment: comment }).
                success(function (response) {
                    console.log('Add comment successfully');
                    return true;
                });
            },
            //like status
            likeStatus: function (statusId, originAccountId, newLike) {
                return $http.put(ProfilebaseUrl + 'likeStatus/' + originAccountId, { statusId: statusId, newLike: newLike }).
                success(function (response) {
                    console.log('Add like successfully');
                    return true;
                });
            },
            //upload file
            uploadImage: function () {
                return $http.post(ProfilebaseUrl + 'uploadImage/').success(function (response) {
                    if (response) {
                        console.log('Uplad image successfully' + response);
                        return true;
                    }
                });
            }
        }
    }]);