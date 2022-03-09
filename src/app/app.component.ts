import { Component, OnInit } from '@angular/core';
// import {NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpClientModule } from '@angular/common/http';
// add the correct parameters of the Api in start


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  board: String = '';

  constructor(
    private httpClient: HttpClient
  ) { }
  ngOnInit(): void {
    this.getState();
    this.getMove1(3);

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
        return response; //gör split här också


      }
    );
  }
  title = 'EDAF90-Project';
}
