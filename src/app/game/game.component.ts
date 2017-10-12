import { Component, OnInit, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import * as io from "socket.io-client";
declare var $ :any;


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

    baraja: any;
    players: any;
    roomName: any;
    newUser = { roomName: this.roomName, nickName: '', clientId: '' };
    statusMessage = { message: '' }
    socket = io('http://localhost:4000');  
    joinned = false;
    ready = false;
    started = false;
    userId: any;
    numOfUser = 0;
    cardsInHand:any;
    selectedCards = [];
    chosenCards = [];
    playedCards = [];
    selfPlayedCards = [];

    @ViewChildren('renderedCard') renderedCard: QueryList<any>;

    constructor() { }
    
    ngOnInit() {
            this.roomName = "VSOP";
            this.newUser.roomName = this.roomName;
            var user = this.getCurrentUserInfo();
            this.socket.on('loggedIn', function(data){
                let currentUser = this.getCurrentUserInfo();
                if(data.room == currentUser.roomName) {
                    this.statusMessage = {
                        message: data.message,
                    }
                    this.joinned = true;
                    this.numOfUser  = data.numOfUser;
                    this.newUser.clientId = data.clientId;
                }
            }.bind(this));

            this.socket.on('newPlayerJoined', function(data){
                this.statusMessage = {
                    message: data.nickName+' joined the game...',
                }
                this.userId = data.clientId;
                this.numOfUser  = data.numOfUser;
            }.bind(this));

            this.socket.on('enableStart', function(data){
                this.checkReadyToStart();
            }.bind(this));

            this.socket.on('displayMyCards', function(cards){
                this.statusMessage = {
                    message: 'Game Started...',
                }
                this.cardsInHand = cards;
            }.bind(this));

            this.displayLastPlayedCards();
    }
    
    ngAfterViewInit() {
        this.renderedCard.changes.subscribe(t => {
            this.ngForRendred();
        })
    }

    ngForRendred() {
        var $el = $( '#handCards' );
        this.baraja = $el.baraja();
        this.fanRight();
    }

    joinGame(event) {
        if(event.keyCode == 13) {
            localStorage.setItem('user', JSON.stringify(this.newUser));
            this.socket.emit('joinGame', { 
                room: this.newUser.roomName, 
                nickName: this.newUser.nickName, 
                message: 'You Joined the game.Yahooooooo!!!'
            });
        }
    }

    startGame() {
        this.socket.emit('initGame');
    }

    chooseCard(activeCard) {
        var activeCardIndex = activeCard.slice(0, -1);
        var cardValue = parseInt(activeCard, 10);
        if (!$.isEmptyObject(this.chosenCards) && $.inArray(cardValue, this.selectedCards) == -1) {
            this.chosenCards = [];
            this.selectedCards = [];
        }
        this.chosenCards.push(activeCard);
        this.selectedCards.push(cardValue);
    }

    playCards() {
        this.selfPlayedCards = this.chosenCards;
        this.socket.emit('playCards', {
            chosenCards: this.chosenCards,
            userId: this.newUser.clientId
        });
    }

    drawLastPlayedCards(lastPlayedCard) {
        this.playedCards.splice( $.inArray(lastPlayedCard, this.playedCards), 1 );
        this.socket.emit('drawLastPlayedCard', {
            lastPlayed: lastPlayedCard,
            userId: this.newUser.clientId
        })
        
    }

    private displayLastPlayedCards() {
        this.socket.on('displayLastPlayedCards', function(data){
            this.playedCards = [];
            this.playedCards = data.lastPlayed;
            this.chosenCards = [];
            this.selectedCards = [];
        }.bind(this));
    }

    private drawFromDeck() {
        this.socket.emit('drawFromDeck', {
            userId: this.newUser.clientId
        })
    }

    private getCurrentUserInfo() {
        return JSON.parse(localStorage.getItem("user"));    
    }

    private checkReadyToStart() {
        if(this.numOfUser > 1) {
            this.ready = true;
            this.started = false;
        }
    }

    private isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    private inArray(value, array) {
        if(array.indexOf(value) != -1)
        {  
            return true;
        }
        return false;
    }

    fanRight() {
        var $el = $( '#handCards' );
        this.baraja = $el.baraja();
        this.baraja.fan( {
          speed : 500,
          easing : 'ease-out',
          range : 90,
          direction : 'right',
          origin : { x : 25, y : 100 },
          center : true
        });
      }
    
    private centeredRound() {
        this.baraja.fan( {
            speed : 500,
            easing : 'ease-out',
            range : 360,
            direction : 'right',
            origin : { x : 50, y : 90 },
            center : false
        } );
    }

    private rotateHorizontal() {
        this.baraja.fan( {
            speed : 500,
            easing : 'ease-out',
            range : 100,
            direction : 'right',
            origin : { x : 50, y : 200 },
            center : true
        } );
    }

    private close() {
        this.baraja.close();
    }
}
