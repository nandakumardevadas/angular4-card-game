import { Component, OnInit } from '@angular/core';
import * as io from "socket.io-client";
declare var $ :any;


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  players: any;
  roomName: any;
  newUser = { roomName: this.roomName, nickName: '' };
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
}
