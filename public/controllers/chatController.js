angular.module('productApp').
controller('chatController', ['socket', '$scope','$rootScope','$window','$location','profileService',
 function (socket, $scope,$rootScope,$window,$location,profileService) {
    console.log('come back to server');
    $scope.$on('$routeChangeStart', function(next, current) { 
       console.log('left the room');

       profileService.getDesiredFriends($rootScope.currentUser.userId).then(function (result) {
                console.log('get friends succss '+$rootScope.currentProfile.fullName.first);
           var currentUser = $rootScope.currentProfile.fullName.first + ' ' + $rootScope.currentProfile.fullName.last;
       //we should emit left trigger
       //to other user in chat and delete your name from chatroom
        //we must delete this user from list
         socket.emit('user:left',{
            user : currentUser
           })
        if($scope.users){
             for (var i = 0; i < $scope.users.length; i++) {
            if (currentUser == $scope.users[i]) {
                $scope.users.splice(i, 1);
              }
            }
          
        }
       
       });

       
     });

    if(!$rootScope.currentUser){
        console.log('login please ');
        $location.path('/login');
    }else if ($rootScope.currentUser && !$rootScope.currentProfile){
            console.log('we are refresh the page');
            $location.path('/');
           
    }else{
    
    $scope.messages = [];
    $scope.users = [];
    
    //trigger first request from client
    socket.emit('user:join', {
      userName: $rootScope.currentProfile.fullName.first + ' ' + $rootScope.currentProfile.fullName.last
    });

   

    //////forth method after start chat for  you
    socket.on('you:join',function (data) {
        console.log('come back afer refresh you:join');
        $scope.messages.push({
            user: 'chatRoom',
            text: 'You are known as ' + $rootScope.currentProfile.fullName.first
        });
         $scope.users = data.userNames;
    })
    
    
    socket.on('user:join', function (data) {
        console.log('come back afer refresh user:join ');
        $scope.messages.push({
            user: 'ChatRoom',
            text: 'User ' + data.newUser + ' has joined'
        });
         $scope.users = data.userNames;
    });

    $scope.sendMessage = function () {
        console.log('send message' + $scope.message);
        $scope.messages.push({
            user: 'You',
            text: $scope.message
        });
        socket.emit('send:message', {
            message: $scope.message,
            user: $rootScope.currentProfile.fullName.first
        });
    };

    //we recive the message back from seever ofr all the client
    //by socket.broadcast.emit('send:message' and must recive as on 
    socket.on('send:message', function (data) {
        $scope.messages.push({
            user: data.user,
            text: data.text
        });
    });

    socket.on('user:left', function (data) {
        //we must delete this user from list
        for (var i = 0; i < $scope.users.length; i++) {
            if (data.userName == $scope.users[i]) {
                $scope.users.splice(i, 1);
            }
        }
        $scope.messages.push({
            user: 'Chatroom',
            text: 'User ' + data.userName + ' has just left chatroom'
        });
    });

  }
   
}]);