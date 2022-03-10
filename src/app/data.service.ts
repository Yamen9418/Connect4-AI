import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  mode!: string;
  diff!: string;

  constructor() { }
}
