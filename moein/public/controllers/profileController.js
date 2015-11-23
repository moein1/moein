angular.module('productApp').
controller('profileController', ['$scope', '$rootScope', '$location', 'profileService', 'alertingService',
    'modalService', '$cookieStore', 'fileUpload','$http','socket',
    function ($scope, $rootScope, $location, profileService, alertingService,
     modalService, $cookieStore, fileUpload, $http , socket) {

        if(!$rootScope.currentUser){
         $location.path('/login')
        }
        if ($rootScope.currentUser && !$rootScope.currentProfile){
            getDesiredFriends($rootScope.currentUser.userId);
            console.log('this is refres')
           // getRequestedFriends();
        }

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
                    alertingService.startAlert('ok', 'Your image has been uploaded successfully please Press Save');
                    $scope.uploadMessage = 'Your image has been uploaded successfully please Press Save button for change your profile picture';
                    $scope.currentImage = files[0].name;
                } else {
                    alertingService.startAlert('error', result.message);
                    $scope.currentImage = '';
                }


            }).error(function (error) {
                alertingService.startAlert('error', 'Upload image failed');
            });
            //}
            // }
        };
   
        $scope.save = function () {
            if (document.getElementById('uploadFile').files[0]) {
                var uploadfile = document.getElementById('uploadFile').files[0].name;
               
                $rootScope.currentProfile.uploadedFile = uploadfile;
            }
            
           
            console.log(name);
            profileService.updateProfile($rootScope.currentProfile).then(
                 function (result) {
                     if (result) {
                         //update activity and friend activty
                         //getDesiredFriends($rootScope.currentProfile._id);
                         $rootScope.currentProfile.uploadedFile = uploadfile;
                         alertingService.startAlert('ok', 'Your profile has been updated successfully');
                     } else {
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
           
            profileService.addStatus({ status: $scope.newStatus.text }, $rootScope.currentProfile._id).then(function (result) {
                if (result) {
                    //third approach is getting update activity bck from servr
                    $scope.currentActivity = result.activities;
                    $scope.currentStatus = result.status;
                    //secons approch for adding new status manully


                    var newStatus = {
                        fullName: $rootScope.currentProfile.fullName,
                        status: $scope.newStatus.text,
                        photoUrl: $rootScope.currentProfile.uploadedFile,
                        added: new Date(),
                        accountId:$rootScope.currentProfile._id
                    };
                    tempStatus.push(newStatus);
                    $cookieStore.put('tempStatus', tempStatus);
                    $rootScope.currentProfile.status.push(newStatus);
                    $rootScope.currentProfile.activity.push(newStatus);
                    //it this case if you refresh the page the currently change information
                    //can not be seen so we must store this just added data to a temperary place
                    
                    alertingService.startAlert('ok', 'new status added to your profile successfully');
                    $scope.newStatus.text = '';
                } else {
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
                   
                    var yourLikes = [];
                    var yourComments = [];
                    //get the list of your like and comment
                    for (var i = 0; i < $rootScope.currentActivity.length; i++) {
                        for (var j = 0; j < $rootScope.currentActivity[i].comments.length; j++) {
                            if ($rootScope.currentActivity[i].comments[j].accountId == $rootScope.currentProfile._id) {
                                //you comment on this status
                                yourComments.push($rootScope.currentActivity[i]._id);
                            }
                        }
                        //likes list
                        for (var k = 0; k < $rootScope.currentActivity[i].likes.length; k++) {
                            if ($rootScope.currentActivity[i].likes[k].accountId == $rootScope.currentProfile._id) {
                                //your like on this state
                                yourLikes.push($rootScope.currentActivity[i]._id);
                            }
                        }
                    }
                    
                }

            });
        }

        //get requested friends
        //$scope.requestedFriends = [];
       // $scope.askedFriends=[];
        //console.log('contact list is :'+ $rootScope.currentUser.contacts);
        function getRequestedFriends() {
            var contactsList = $rootScope.currentProfile.contacts;
            for (var i = 0; i < contactsList.length; i++) {
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
            profileService.SendFriendRequest($rootScope.currentProfile._id, contactId).then(function (result) {
                if (result) {
                    alertingService.startAlert('ok', 'Your friend request has been sent successfully');
                    getDesiredFriends($rootScope.currentProfile._id);

                } else {
                    alertingService.startAlert('error', 'Sending request friends failed');
                }
            });
        }

        $scope.AcceptFriend = function (contactId) {
            profileService.AcceptFriend($rootScope.currentProfile._id, contactId).then(function (result) {
                if (result) {
                    alertingService.startAlert('ok', 'accepting friend successfully');
                    getDesiredFriends($rootScope.currentProfile._id);
                }
                else {
                    alertingService.startAlert('error', 'accpeting friend ask failed');
                }
            });
        }

        //sharing a status with all friends
        //at this time by using this our status will be shared between all friends
        $scope.shareStatus = function (status) {
            
            profileService.shareStatus($rootScope.currentProfile._id,status).then(function (result) {
                if (result) {
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
                fullName: { first: $rootScope.currentProfile.fullName.first, last: $rootScope.currentProfile.fullName.last },
                accountId: $rootScope.currentProfile._id,
                commentText: statusText,
                photoUrl: $rootScope.currentProfile.uploadedFile,
                added: new Date()
            };
            profileService.addCommnet(statusId, originAccountId, newComment).then(function (result) {
                if (result) {
                    console.log('add comment success');
                    getDesiredFriends($rootScope.currentProfile._id);
                } else {
                }
            });
        }

        $scope.likeStatus = function (statusId, originAccountId) {

            //first we need to create a like object
            var newLike = {
                fullName: { first: $rootScope.currentProfile.fullName.first, last: $rootScope.currentProfile.fullName.last },
                accountId: $rootScope.currentProfile._id,
                added: new Date()
            };

            profileService.likeStatus(statusId, originAccountId,newLike).then(function (result) {
                if (result) {
                    getDesiredFriends($rootScope.currentUser.userId);
                } else {
                }
            });
        }

        function init() {
            //at the same time we can catch request asked desired and accept friends
            //we can also catch current activity
            if ($rootScope.currentUser)
                getDesiredFriends($rootScope.currentUser._id);
           // getRequestedFriends();
        }

        //initial function
       // init();
    }]);