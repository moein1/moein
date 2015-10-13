angular.module('productApp').
controller('chatController', ['socket', '$scope','$rootScope', function (socket, $scope,$rootScope) {

    $scope.messages = [];
    $scope.users = [];
    //after sart connection in socket service the 
    //server side has been sent an initial method
    //by socket.emit('init' 
    //and we must recive this emit by this on method
    socket.on('init', function (data) {
        console.log('initial users ' + data.users);
        $scope.users = data.users;
        $scope.users.push($rootScope.currentUser.fullName.first + ' ' + $rootScope.currentUser.fullName.last);
        $scope.messages.push({
            user: 'chatRomm',
            text: 'You are known as ' + $rootScope.currentUser.fullName.first
        });
    });

    //in rality we must the username from client side to server
    //and recive in server and broaadast to all the user that a new user
    //has joint the room
    

    socket.emit('user:join', {
        userName: $rootScope.currentUser.fullName.first + ' ' + $rootScope.currentUser.fullName.last
    });

    //we must recive the message from server
    //as joint a new user  socket.broadcast.emit('user:join'
    //by an on 
    socket.on('user:join', function (data) {
        //console.log('we recive user:join' + data);
        $scope.messages.push({
            user: 'ChatRoom',
            text: 'User ' + data.userName + ' has joined'
        });
        $scope.users.push(data.userName);

    });

    $scope.sendMessage = function () {
        console.log('send message' + $scope.message);
        $scope.messages.push({
            user: 'You',
            text: $scope.message
        });
        socket.emit('send:message', {
            message: $scope.message,
            user: $rootScope.currentUser.fullName.first
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


   
}]);