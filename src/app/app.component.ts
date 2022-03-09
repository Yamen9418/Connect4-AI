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

  constructor(
    private httpClient: HttpClient
  ) { }
  ngOnInit(): void {
    this.getState();
  }
  getState() {
    this.httpClient.get<any>('http://localhost:8000/state').subscribe(
      response => {
        console.log(response);
        //this.friends = response;
      }
    );
  }

  // getMove1(col) {
  //   this.httpClient.get<any>('http://localhost:8000/move1/{col}').subscribe(
  //     response => {
  //       console.log(response);
  //       //this.friends = response;
  //     }
  //   );
  // }
  title = 'EDAF90-Project';
}
