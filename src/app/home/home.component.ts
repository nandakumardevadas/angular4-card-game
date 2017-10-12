import { Component, OnInit } from '@angular/core';
import mojs from 'mojs';
declare var $ :any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  baraja: any;
  constructor() { }

  ngOnInit() {
    var $el = $( '#baraja-el' );
    this.baraja = $el.baraja();
  }

  fanRight() {
    this.baraja.fan( {
      speed : 500,
      easing : 'ease-out',
      range : 90,
      direction : 'right',
      origin : { x : 25, y : 100 },
      center : true
    });
  }

  centeredRound() {
    this.baraja.fan( {
      speed : 500,
      easing : 'ease-out',
      range : 360,
      direction : 'right',
      origin : { x : 50, y : 90 },
      center : false
    } );
  }

  rotateHorizontal() {
    this.baraja.fan( {
      speed : 500,
      easing : 'ease-out',
      range : 100,
      direction : 'right',
      origin : { x : 50, y : 200 },
      center : true
    } );
  }

  close() {
    this.baraja.close();
  }

}
