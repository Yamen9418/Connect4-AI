import { Component, OnInit } from '@angular/core';
// import {NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpClientModule } from '@angular/common/http';
// add the correct parameters of the Api in start
import {GameComponent} from "./game/game.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  board: String = '';
  bestmove: number = 0;

  constructor(
    private httpClient: HttpClient
  ) { }
  ngOnInit(): void {
    // this.getState();
    // this.getMove1(3);
    // this.postBoard()

  }
  getState() {
    this.httpClient.get<any>('http://localhost:8000/state').subscribe(
      (response: String) => {
        //console.log(typeof response);
        this.board = response;
        console.log(this.board)
        return response;

      }
    );
  }

  getMove1(col: number) {
    this.httpClient.get<any>('http://localhost:8000/move1/' + col).subscribe(
      response => {
        this.board = response.split("Is_done").pop();
        console.log(this.board)
        return response; //gör split här också


      }
    );
  }


  // postBoard() {
  //   this.httpClient.post<any>('http://localhost:8000/board/', {board: this.board}).subscribe({
  //       next: data => {
  //           this.bestmove = data;
  //           console.log(this.bestmove)
  //       },
  //       error: error => {
  //           console.error('There was an error!', error);
  //       }
  //   })
  // }


  title = 'EDAF90-Project';
}
