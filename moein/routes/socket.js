
//keep track of names
var userNames = (function () {
    var Names = [];

    //serialize cliamed name as an arryy
    var get = function () {
      
        console.log('names are :'+Names);
        return Names;
    }
    //insert new user

    var add = function (name) {
        Names.push(name);
    }
    //delee user from list
    
    var free = function (name) {
      
        for (var i = 0; i < Names.length; i++) {
            if (Names[i] == name) {
                Names.splice(i, 1);
                break;
            }
        }
    }

    return {
        get: get,
        add: add,
        free: free
    };

}());
        
module.exports = function (socket) {

    //recive user join
    var name;
    //send the new user the name and list of users
    //first method after start chat ---> next one in client side
    socket.emit('init', {
        users: userNames.get()
    });

    //emit to all other user that
    //an new user has joined the room
    ////third method after start chat ---> next one in client side
    socket.on('user:join', function (data) {
        console.log('user:join '+data.userName);
        userNames.add(data.userName);
        console.log('user list are ' + userNames.get());
        //send all the other users the new user name
        name = data.userName;
        socket.broadcast.emit('user:join', {
            userNames : userNames.get(),
            newUser : data.userName
        });
        socket.emit('you:join',{
            userNames : userNames.get()
        });
        
    });

    socket.on('user:left',function (data) {
       console.log('user '+data.user +' has left room');
       userNames.free(data.user);
       socket.broadcast.emit('user:left',{
        userName : data.user
       })
    })
    //recive the send:message emit in client
    socket.on('send:message', function (data) {
        //broadcast a user message to all the user in net
        //you must recive this broadcast for all user in client side
        console.log('message recive ' + data);
        socket.broadcast.emit('send:message', {
            user: data.user,
            text: data.message
        });
    });

    socket.on('disconnect', function () {
        userNames.free(name);
        socket.broadcast.emit('user:left', {
            userName: name
        });
    });

    
}