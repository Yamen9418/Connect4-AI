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
  board2d!: number[][];
  playerIsNext!: boolean;
  winner!: number | null;

  constructor() { 
  }

  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.board = Array(this.height * this.width).fill(null);
    this.board2d = Array(this.width).fill(Array(this.height).fill(0));
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
          this.board2d[x][y - 1] = this.player;
          break;
        } else if (y == this.height - 1) {
          this.board.splice(index, 1, this.player);
          this.board2d[x][y] = this.player;
          break;
        }
      }

      this.playerIsNext = !this.playerIsNext;
    }

    this.calculateWinner();
  }

  calculateWinner() {
    for (let index = 0; index < this.board2d.length; index++) {
      const element = this.board2d[index][0];

      if (element == 0) {
        break;
      } else if (element != 0 && index == this.board2d.length - 1) {
        this.winner = 0;
      }
    }
  }

  transpose(board: number[][]) {
    let transposed = Array(board[0].length).fill(Array(board.length).fill(0));
    
    for(var i = 0; i < board.length; i++){
        for(var j = 0; j < board[0].length; j++){
            transposed[j][i] = board[i][j];
        };
    };
  }
  
  flip(board: number[][]) {
    let flipped = Array(board.length).fill(Array(board[0].length).fill(0));
  }
}
