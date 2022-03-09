import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { MainComponent } from './main/main.component';
import { StatsComponent } from './stats/stats.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'game', component: GameComponent },
  { path: 'stats', component: StatsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }