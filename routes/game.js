var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var cards = require('../utilities/cards');
var numOfUser = 0;
var pack, shuffledPack;
var hands = {};

server.listen(4000);
io.on('connection', function(socket){
    console.log('User Connected');
    socket.on('disconnect', function(){
        if(numOfUser > 0) {
            numOfUser--;
        }
        this.leave(socket.room);
        console.log('User Disconnected');
    });

    socket.on('joinGame', function(data){
        numOfUser++;
        let messageString = data.message;
        socket.username = data.nickName;
        socket.room = data.room;
        data.numOfUser = numOfUser;
        data.message = (numOfUser == 1) ? messageString+' Waiting for other players to join!!!' : messageString;
        this.emit('loggedIn', data);
        this.broadcast.emit('newPlayerJoined', data);
        this.join(socket.room);    
        io.to(socket.room).emit('enableStart', data);   
    }); 

    socket.on('initGame', function(){
        pack = cards.createPack();
        shuffledPack = cards.shufflePack(pack);  
        // console.log("Size of pack before draw: " + socket.shuffledPack.length);  
        // console.log("Drawing 5 cards.");  
        // socket.hand = cards.draw(socket.myPack, 5, '', true);  
        // console.log("Size of pack after draw: " + socket.myPack.length);  
        // console.log("Cards in hand:");  
        // console.log(socket.hand); 
        let clients = getClientsByRoom(socket.room);
        console.log(clients);
        for (var clientId in clients ) {
            let hand = hands[clientId] = cards.draw(shuffledPack, 5, '', true);
            //this is the socket of each client in the room.
            let clientSocket = io.sockets.connected[clientId].emit('displayMyCards', hand);
    
        }
        console.log(shuffledPack.length);
    });
});

function getClientsByRoom(roomName) {
    return io.sockets.adapter.rooms[roomName].sockets;
}
router.get('/', function(request, response, next){
    response.send('Game Index');
});

module.exports = router;