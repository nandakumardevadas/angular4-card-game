import { Component, OnInit } from '@angular/core';
import * as io from "socket.io-client";


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
  numOfUser = 0;

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
            this.numOfUser  = data.numOfUser;
        }.bind(this));

        this.socket.on('enableStart', function(data){
            this.checkReadyToStart();
        }.bind(this));

        this.socket.on('displayMyCards', function(cards){
            console.log(cards);
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

  private getCurrentUserInfo() {
    return JSON.parse(localStorage.getItem("user"));    
  }

  private checkReadyToStart() {
      console.log(this.numOfUser);
    if(this.numOfUser > 1) {
        this.ready = true;
        this.started = false;
    }
  }



}
