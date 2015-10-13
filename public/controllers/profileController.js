angular.module('productApp').
controller('profileController', ['$scope', '$rootScope', '$location', 'profileService', 'alertingService',
    'modalService', '$cookieStore', 'fileUpload','$http',
    function ($scope, $rootScope, $location, profileService, alertingService, modalService, $cookieStore, fileUpload, $http) {

        var uploadUrl = '/api/uploadFile';
       // $scope.currentImage;
        $scope.uplaodImage = function () {
            var formData = $scope.newForm;
            
            fileUpload.uploadFileToUrl(formData, uploadUrl);
        }
        $scope.uploadFile = function (files) {
            $scope.uploadMessage = '';
            $scope.currentImage = '';
            var fd = new FormData();
            //Take the first selected file
            //firstly we must check the file for forbid the latge one
            /* if (files[0].size > 30000) {
                 //alertingService.startAlert('error', 'File size must be less than 30k');
 
                 $scope.uploadMessage = 'File size must be less than 30k';
                 console.log('the file is too big');
                 $scope.currentImage = '';
             } else {
                 if (files[0].type != 'image/jpeg') {
                     // alertingService.startAlert('error', 'File type must be image/jpeg only');
                     $scope.uploadMessage = 'File type must be image/jpeg only';
                     console.log('file type is wrong');
                     $scope.currentImage = '';
                 } else {*/
            fd.append("file", files[0]);
            $http.post(uploadUrl, fd, {
                withCredentials: true,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            }).success(function (result) {
                console.log(result);
                if (result.status) {
                    console.log('upload file successfully');
                    alertingService.startAlert('ok', 'Your image has been uploaded successfully please Press Save');
                    $scope.uploadMessage = 'Your image has been uploaded successfully please Press Save button for change your profile picture';
                    $scope.currentImage = files[0].name;
                } else {
                    console.log(result.message);
                    alertingService.startAlert('error', result.message);
                    $scope.currentImage = '';
                }


            }).error(function (error) {
                console.log('upload file failed');
                alertingService.startAlert('error', 'Upload image failed');
            });
            //}
            // }
        };
   
        $scope.save = function () {
            console.log(document.getElementById('uploadFile').files[0]);
            if (document.getElementById('uploadFile').files[0]) {
                var uploadfile = document.getElementById('uploadFile').files[0].name;
               
                $rootScope.currentUser.uploadedFile = uploadfile;
            }
            
           
            console.log(name);
            profileService.updateProfile($rootScope.currentUser).then(
                 function (result) {
                     if (result) {
                         console.log('updating profile in last stage befr alerting message');
                         //update activity and friend activty
                         getDesiredFriends($scope.currentUser._id);
                         alertingService.startAlert('ok', 'Your profile has been updated successfully');
                     } else {
                         console.log('error updating profile');
                         alertingService.startAlert('error', 'Updatin profile failed');
                     }
                 });
        }

        var modalOptions = {
            closeButtonText: 'Cancel',
            actionButtonText: 'Leave now',
            headerText: 'Cancel update profile',
            bodyText:'Are you sure to cancel updating your profile !?'
        }

        $scope.cancel = function () {
            //showing modal after cancel profile update
            modalService.showModal({}, modalOptions).then(function (result) {
                if (result == 'ok') {
                    $location.path('/');
                }
            });

        }
        //$scope.currentStatus = $scope.currentUser.status;
        $scope.newStatus = {}
        //temp place for just added state
        var tempStatus = [];
        $cookieStore.put('tempStatus', tempStatus);
        $scope.addStatus = function () {
            //we should send the satus and the current user id and the serveer can add the current date itself
           
            profileService.addStatus({ status: $scope.newStatus.text }, $rootScope.currentUser._id).then(function (result) {
                if (result) {
                    console.log('add new status to account successfully');
                    //third approach is getting update activity bck from servr
                    $scope.currentActivity = result.activities;
                    $scope.currentStatus = result.status;
                    //secons approch for adding new status manully


                    var newStatus = {
                        fullName: $rootScope.currentUser.fullName,
                        status: $scope.newStatus.text,
                        photoUrl: $rootScope.currentUser.uploadedFile,
                        added: new Date(),
                        accountId:$rootScope.currentUser._id
                    };
                    tempStatus.push(newStatus);
                    $cookieStore.put('tempStatus', tempStatus);
                    $rootScope.currentUser.status.push(newStatus);
                    $rootScope.currentUser.activity.push(newStatus);
                    //it this case if you refresh the page the currently change information
                    //can not be seen so we must store this just added data to a temperary place
                    
                    alertingService.startAlert('ok', 'new status added to your profile successfully');
                    $scope.newStatus.text = '';
                } else {
                    console.log('adding status failed');
                    alertingService.startAlert('error', 'adding new status to your account failed');
                }
            });
        }
        //friend request part
        //for start we can propose for example 10 friends from your country 
        //and 10 friend friend from your same professional state
        // $scope.desiredFriends = [];
        
        function getDesiredFriends(accountId) {
            profileService.getDesiredFriends(accountId).then(function (result) {
                if (result) {
                    //console.log('get friends succesfully in controller :'+result.data);
                    $rootScope.desiredFriends = result.desiredFriends;
                    $rootScope.askedFriends = result.askedFriends;
                    $rootScope.requestedFriends = result.recievedFriends;
                    $rootScope.acceptFriends = result.acceptFriends;
                    //console.log('accept friends are' + $scope.acceptFriends);
                    $rootScope.desiredFriendsClass = 'icon_plus';
                    //adding current activity and state
                    $rootScope.currentActivity = result.accountActivity;
                    $rootScope.currentStatus = result.accountState;

                    var yourLikes = [];
                    var yourComments = [];
                    //get the list of your like and comment
                    for (var i = 0; i < $rootScope.currentActivity.length; i++) {
                        for (var j = 0; j < $rootScope.currentActivity[i].comments.length; j++) {
                            if ($rootScope.currentActivity[i].comments[j].accountId == $rootScope.currentUser._id) {
                                //you comment on this status
                                yourComments.push($rootScope.currentActivity[i]._id);
                            }
                        }
                        //likes list
                        for (var k = 0; k < $rootScope.currentActivity[i].likes.length; k++) {
                            if ($rootScope.currentActivity[i].likes[k].accountId == $rootScope.currentUser._id) {
                                //your like on this state
                                yourLikes.push($rootScope.currentActivity[i]._id);
                            }
                        }
                    }
                    
                    console.log('your comment list' + yourComments);
                    console.log('your like list' + yourLikes);
                }

            });
        }

        //get requested friends
        //$scope.requestedFriends = [];
       // $scope.askedFriends=[];
        //console.log('contact list is :'+ $rootScope.currentUser.contacts);
        function getRequestedFriends() {
            var contactsList = $rootScope.currentUser.contacts;
            for (var i = 0; i < contactsList.length; i++) {
                console.log('status are :' + contactsList[i].status);
                if (contactsList[i].status == 'recieved') {
                    $scope.requestedFriends.push(contactsList[i]);
                }
                if (contactsList[i].status == 'sent') {
                    $scope.askedFriends.push(contactsList[i]);
                }
            };

            //console.log('recived friend list is ' + $scope.requestedFriends);
        }

        //we must send the friend request to server to contactId and 
        //ifv this is successful we must channge the icon class that the friend requst has
        //been send if the request has been responsed 
        // we must remove this from add friend page and add to friends page

        $scope.SendFriendRequest = function (contactId) {
            profileService.SendFriendRequest($rootScope.currentUser._id, contactId).then(function (result) {
                if (result) {
                    alertingService.startAlert('ok', 'Your friend request has been sent successfully');
                    getDesiredFriends($rootScope.currentUser._id);

                } else {
                    alertingService.startAlert('error', 'Sending request friends failed');
                }
            });
        }

        $scope.AcceptFriend = function (contactId) {
            profileService.AcceptFriend($rootScope.currentUser._id, contactId).then(function (result) {
                if (result) {
                    console.log('you accepted friend request successfully');
                    alertingService.startAlert('ok', 'accepting friend successfully');
                    getDesiredFriends($rootScope.currentUser._id);
                }
                else {
                    alertingService.startAlert('error', 'accpeting friend ask failed');
                }
            });
        }

        //sharing a status with all friends
        //at this time by using this our status will be shared between all friends
        $scope.shareStatus = function (status) {
            
            profileService.shareStatus($rootScope.currentUser._id,status).then(function (result) {
                if (result) {
                    console.log('Your status has been shared successfully');
                    alertingService.startAlert('ok', 'your status shared successfully');
                } else {
                    alertingService.startAlert('error', 'sharing status with friends failed');
                }
            });
        }

        //add comment to a status
        //we need to have the id of status and the accountId of the 
        //orginial sender of status
        //because we need to add this comment to all the
        //reciever of this 
        //also we need the id of the current user that write this comment
        
        $scope.addCommnet = function (statusId, originAccountId,statusText) {
            //we need to create the comment body here
            //all the information belong to sender of the comment
            //but for braodcast the message we need
            //originAccount who has sent the status first
            var newComment = {
                fullName: { first: $scope.currentUser.fullName.first, last: $scope.currentUser.fullName.last },
                accountId: $scope.currentUser._id,
                commentText: statusText,
                photoUrl: $scope.currentUser.uploadedFile,
                added: new Date()
            };
            profileService.addCommnet(statusId, originAccountId, newComment).then(function (result) {
                if (result) {
                    console.log('Add comment to status successfully');
                    getDesiredFriends($rootScope.currentUser._id);
                } else {
                    console.log('add comment to status failed');
                }
            });
        }

        $scope.likeStatus = function (statusId, originAccountId) {

            //first we need to create a like object
            var newLike = {
                fullName: { first: $scope.currentUser.fullName.first, last: $scope.currentUser.fullName.last },
                accountId: $scope.currentUser._id,
                added: new Date()
            };

            profileService.likeStatus(statusId, originAccountId,newLike).then(function (result) {
                if (result) {
                    console.log('Add like to status successfully');
                    getDesiredFriends($rootScope.currentUser._id);
                } else {
                    console.log('Add like failed');
                }
            });
        }

        function init() {
            //at the same time we can catch request asked desired and accept friends
            //we can also catch current activity
            if ($rootScope.currentUser)
                getDesiredFriends($scope.currentUser._id);
           // getRequestedFriends();
        }

        //initial function
        init();
    }]);