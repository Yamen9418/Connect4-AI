import { Component, Inject, OnInit } from '@angular/core';
import { StatEntry } from '../stats/stats.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DataService } from '../data.service';
import { NumberSymbol } from '@angular/common';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements OnInit {
  height = 6;
  width = 7;

  diff: string | undefined;
  mode: string | undefined;
  board!: number[];
  playerIsNext!: boolean;
  winner!: number | null;
  botmove!: number;

  constructor(
    private httpClient: HttpClient,
    public data: DataService
  ) {}

  ngOnInit(): void {
    this.mode = this.data.mode;
    this.diff = this.data.diff;
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

  botMove(gameBoard: number[][]) {
    //this.postBoard(gameBoard);
    let x = 2;
    console.log(x);

    if (!this.board[x]) {
      for (let y = this.height - 1; y >= 0; y--) {
        const index = x + y * this.width;
        if (!this.board[index]) {
          this.board[index] = this.player;
          break;
        }
      }

      this.playerIsNext = !this.playerIsNext;
    }
      let board2d = this.build2dtable(this.board);
      this.winner = this.calculateWinner(board2d);

      if (this.winner != null) {
        console.log(this.winner);
        this.addEntry("player", this.winner);
      }
  }




  makeMove(i:number) {
    if (this.winner == null && !(this.mode == 'AI' && !this.playerIsNext)) {
      let x = i % this.width;
      
      if (!this.board[x]) {
        for (let y = this.height - 1; y >= 0; y--) {
          const index = x + y * this.width;
          if (!this.board[index]) {
            this.board[index] = this.player;
            break;
          }
        }

        this.playerIsNext = !this.playerIsNext;
      }
      let board2d = this.build2dtable(this.board);
      this.winner = this.calculateWinner(board2d);

      if (this.winner != null) {
        console.log(this.winner);
        this.addEntry("player", this.winner);
      }
      if (this.mode == 'AI') {
        this.botMove(board2d);
      }
    }
  }

  calculateWinner(board2d: number[][]) {
    for (let col = 0; col < board2d[0].length; col++) {
      if (board2d[0][col] == 0) {
        break;
      } else if (col == board2d[0].length - 1) {
        return 0;
      }
    }

    // check columns
    for (let row = 0; row < board2d.length; row++) {
      for (let col = 0; col < board2d[0].length - 3; col++) {
        let sum = this.getRangeSum(board2d[row], col, col + 4);
        if (sum == 4 || sum == -4) {
          return sum / 4;
        }
      }
    }

    // check rows
    let transposed = this.transpose(board2d)
    for (let row = 0; row < transposed.length; row++) {
      for (let col = 0; col < transposed[0].length - 3; col++) {
        let sum = this.getRangeSum(transposed[row], col, col + 4);
        if (sum == 4 || sum == -4) {
          return sum / 4;
        }
      }
    }

    // Test diagonal \
    for (let row = 0; row < board2d.length - 3; row++) {
      for (let col = 0; col < board2d[0].length - 3; col++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += board2d[row + k][col + k];
          if (sum == 4 || sum == -4) {
            return sum / 4;
          }
        }
      }
    }

    // Test diagonal /
    for (let row = 0; row < board2d.length - 3; row++) {
      for (let col = 3; col < board2d[0].length; col++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += board2d[row + k][col - k];
          if (sum == 4 || sum == -4) {
            return sum / 4;
          }
        }
      }
    }
    return null;
  }

  addEntry(type:"bot" | "player", winner:number) {
    const data = localStorage.getItem('stats');
    let entries: StatEntry[];

    if (data) {
      entries = JSON.parse(data);
    } else {
      entries = [];
    }

    entries.push(new StatEntry(type, winner));
    localStorage.setItem('stats', JSON.stringify(entries));
  }

  build2dtable(board: number[]) {
    let board2d = Array(this.height).fill(null).map(()=>Array(this.width).fill(0))
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        let idx = j + i * this.width;
        if (board[idx]) board2d[i][j] = board[idx];
      }
    }
    return board2d;
  }

  // fetching : sending game board to the API
  // data : the best move according to the AI algorithm
  // depth : by default it is 4
  async postBoard(board2d: number [][]) {
    this.httpClient.post<any>('http://localhost:8000/board/',
      {board: board2d, depth : this.diff})
      .subscribe({
        next: async data => {
          this.botmove = await data
          return

        },
        error: error => {
            console.error('There was an error! check game.component.ts line 171', error);
        }
    })
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

  getRangeSum(arr: number[], from: number, to: number) {
    return arr.slice(from, to).reduce((p, c) => {
      return p + c;
    }, 0);
  }
}
