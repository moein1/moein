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
                                result = response.data;
                                $rootScope.desiredFriends = result.desiredFriends;
                                $rootScope.askedFriends = result.askedFriends;
                                $rootScope.requestedFriends = result.recievedFriends;
                                $rootScope.acceptFriends = result.acceptFriends;
                                $rootScope.desiredFriendsClass = 'icon_plus';
                                //adding current activity and state
                                $rootScope.currentActivity = result.accountActivity;
                                $rootScope.currentStatus = result.accountState;
                                $rootScope.currentProfile = result.currentProfile;
                            return {
                                desiredFriends: response.data.desiredFriends,
                                askedFriends: response.data.askedFriends,
                                recievedFriends: response.data.recievedFriends,
                                acceptFriends: response.data.acceptFriends,
                                accountActivity: response.data.accountActivity,
                                accountState: response.data.accountState,
                                currentProfile : response.data.currentProfile
                            };
                        }
                    });

            },
            //send friend request
            SendFriendRequest: function (accountId, contactId) {
                return $http.put(ProfilebaseUrl + 'sendFriendRequest/' + accountId, { contactId: contactId }).
                    success(
                    function (response) {
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
                    return true;
                });
            },
            //like status
            likeStatus: function (statusId, originAccountId, newLike) {
                return $http.put(ProfilebaseUrl + 'likeStatus/' + originAccountId, { statusId: statusId, newLike: newLike }).
                success(function (response) {
                    return true;
                });
            },
            //upload file
            uploadImage: function () {
                return $http.post(ProfilebaseUrl + 'uploadImage/').success(function (response) {
                    if (response) {
                        return true;
                    }
                });
            }
        }
    }]);