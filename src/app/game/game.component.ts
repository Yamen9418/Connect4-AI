import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements OnInit {
  board: number[][] | undefined; 
  blueIsNext: boolean | undefined;
  winner: number | undefined;

  constructor() { 
  }

  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.board = Array(7).fill(Array(6).fill(0));
    this.winner = 0;
    this.blueIsNext = false;
  }

  get player() {
    return this.blueIsNext ? 1 : -1;
  }
}
