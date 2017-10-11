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

    socket.on('playCard', function (data) {
        var userPlayedCards = data.cards;
        var hand = playCard(1, hands[data.socketId], data.cards, socket.room);
        var clientSocket = io.sockets.connected[data.socketId].emit('displayMyCards', hand, true);
        console.log(playedCards);
        socket.broadcast.to(socket.room).emit('displayPlayingArea', data.cards);
    });
});

function getClientsByRoom(roomName) {
    return io.sockets.adapter.rooms[roomName].sockets;
}

function playCard(amount, hand, index, currentGameId) {  
    var cardsList = hand;
    for (var e in index) {
      console.log(playedCards.hasOwnProperty(currentGameId));
      if(!playedCards.hasOwnProperty(currentGameId)) {
        playedCards[currentGameId] = [];
      }
      playedCards[currentGameId].push(index[e]);
      console.log('Index'+index[e]);
      var cardIndex = hand.indexOf(index[e]);
      hand.splice(cardIndex, amount);
    }
    return hand;
  }
router.get('/', function(request, response, next){
    response.send('Game Index');
});

module.exports = router;