angular.module('productApp').
factory('socket', ['$rootScope', function ($rootScope) {
    //we must recive this connection request in server side
    //as io.sockets.on('connection', socket);
    //that socket paramete is a function that contain all the 
    //method related to chatting
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName,data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
            
        }
    }
}]);