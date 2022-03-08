import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  entries!: StatEntry[];
  constructor() { }

  ngOnInit(): void {
    const data = localStorage.getItem('stats');

    if (data) {
      this.entries = JSON.parse(data);
    } else {
      this.entries = [];
    }
  }

  resetEntries() {
    this.entries = [];
    localStorage.setItem('stats', JSON.stringify(this.entries));
  }
}

export class StatEntry {
  against!: "bot" | "player";
  winner!: "loss" | "draw" | "win" | "corrupted data";

  constructor(against: "bot" | "player", winner:number) {
    this.against = against;
    this.winner = this.result(winner);
  }

  result(winner:number) {
    switch (winner) {
      case -1:
        return "loss";
      case 0:
        return "draw";
      case 1:
        return "win";
      default:
        return "corrupted data";
    }
  }
}