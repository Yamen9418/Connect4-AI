import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  mode: string | undefined;
  diff: string | undefined;

  constructor() { }
}
