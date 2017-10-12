var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var cards = require('../utilities/cards');
var numOfUser = 0;
var pack, shuffledPack;
var hands = {};
var isGameStarted = false;
var overAllPlayedCards = [];
var userBasedPlayedCards = [];

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
        data.clientId = this.id;
        this.emit('loggedIn', data);
        this.broadcast.emit('newPlayerJoined', data);
        this.join(socket.room);    
        io.to(socket.room).emit('enableStart', data);   
    }); 

    socket.on('initGame', function(){
        pack = cards.createPack();
        shuffledPack = cards.shufflePack(pack);  
        let clients = getClientsByRoom(socket.room);
        console.log(clients);
        for (var clientId in clients ) {
            let hand = hands[clientId] = cards.draw(shuffledPack, 5, '', true);
            let clientSocket = io.sockets.connected[clientId].emit('displayMyCards', hand);
    
        }
        isGameStarted = true;
    });

    socket.on('playCards', function (data) {
        let currentPlayedCards = {
            userId: data.userId,
            card: data.chosenCards,
            handBeforePlaying: hands[data.userId]
        }
        let userPlayedCards = data.chosenCards;
        let handInCurrent = hands[data.userId];
        let hand = cards.playCard(1, hands[data.userId], userPlayedCards);
        let clientSocket = io.sockets.connected[data.userId].emit('displayMyCards', hand, true);
        currentPlayedCards['handAfterPlayed'] = hand;
        overAllPlayedCards.push(userPlayedCards);
        userBasedPlayedCards.push(currentPlayedCards); 
        this.broadcast.emit('displayLastPlayedCards', {
            lastPlayed: userPlayedCards
        });
    });

    socket.on('drawLastPlayedCard', function (data) {
        hands[data.userId].push(data.lastPlayed);
        let clientSocket = io.sockets.connected[data.userId].emit('displayMyCards', hands[data.userId], true);
    });

    socket.on('drawFromDeck', function (data) {
        cards.draw(shuffledPack, 1, hands[data.userId], false);
        if(shuffledPack.length == 0) {
            
        }
        io.sockets.connected[data.userId].emit('displayDrawnDeckCards', hands[data.userId], true);
    });
});

function getClientsByRoom(roomName) {
    return io.sockets.adapter.rooms[roomName].sockets;
}

router.get('/', function(request, response, next){
    response.send('Game Index');
});

module.exports = router;