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
        console.log('cell: ' + cell)
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
    this.winner = this.calculateWinner();
  }

  calculateWinner() {

    // check columns
    for (let col = 0; col < this.board2d.length; col++) {
      for (let row = 0; row < this.board2d[0].length - 3; row++) {
        let sum = 0;
        for (let i = row; i < row + 4; i++) {
          sum += this.board2d[col][i];
        }
        if (sum == 4 || sum == -4) {
          return sum / 4;
        }
      }
    }

    // check rows
    let transposed = this.transpose(this.board2d)
    for (let col = 0; col < transposed.length; col++) {
      for (let row = 0; row < transposed[0].length - 3; row++) {
        let sum = 0
        for (let i = row; i < row + 4; i++) {
          sum += transposed[col][i];
        }
        if (sum == 4 || sum == -4) {
          return sum / 4;
        }
      }
    }

    // Test diagonal \
    for (let row = 0; row < this.board2d.length - 3; row++) {
      for (let col = 0; col < this.board2d[0].length - 3; col++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += this.board2d[col + k][row + k];
          if (sum == 4 || sum == -4) {
            return sum / 4;
          }
        }
      }
    }

    // Test diagonal /
    for (let row = 0; row < this.board2d.length - 3; row++) {
      for (let col = 3; col < this.board2d[0].length; col++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += this.board2d[col - k][row + k];
          if (sum == 4 || sum == -4) {
            return sum / 4;
          }
        }
      }
    }
    return null;
  }

  transpose(board: number[][]) {
    let transposed = Array(board[0].length).fill(null).map(()=>Array(board.length).fill(0))
    for(var i = 0; i < board[0].length; i++){
        for(var j = 0; j < board.length; j++){
            transposed[i][j] = board[j][i];
        };
    };
    return transposed;
  }
  
}
