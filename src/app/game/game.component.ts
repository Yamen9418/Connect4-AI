import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements OnInit {
  height = 6;
  width = 7;

  board!: number[];
  playerIsNext!: boolean;
  winner!: number | null;

  constructor() { 
  }

  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.board = Array(this.height * this.width).fill(null);
    this.winner = null;
    this.playerIsNext = true;
  }

  get player() {
    return this.playerIsNext ? 1 : -1;
  }

  makeMove(i:number) {
    const x = i % this.width;

    if (!this.board[x]) {
      for (let y = 0; y < this.height; y++) {
        const index = x + y * this.width;
        const cell = this.board[index];

        if (cell) {
          this.board.splice(index - this.width, 1, this.player);
          break;
        } else if (y == this.height - 1) {
          this.board.splice(index, 1, this.player);
          break;
        }
      }

      this.playerIsNext = !this.playerIsNext;
    }

    this.calculateWinner();
  }

  calculateWinner() {

  }
}
