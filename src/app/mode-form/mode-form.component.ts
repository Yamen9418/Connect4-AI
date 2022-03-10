import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field'; 
import { diffValidator } from './customvalidator.validator';

@Component({
  selector: 'app-mode-form',
  templateUrl: './mode-form.component.html',
  styleUrls: ['./mode-form.component.css']
})
export class ModeFormComponent {
  modes = ['AI', 'Local'];
  difficulties = [1,2,3,4,5,6,7,8];

  constructor(private router: Router, public fb: FormBuilder) {
    this.router = router;
  }

  modeForm = this.fb.group({
    mode: ['', [Validators.required]],
    diff: [''],
  }, {
    validator: diffValidator("mode", "diff")
  });

  changeDiff(e: any) {
    this.diff?.setValue(e.target.value, {
      onlySelf: true,
    });
  }

  changeMode(e: any) {
    this.mode?.setValue(e.target.value, {
      onlySelf: true,
    });
  }

  get mode() {
    return this.modeForm.get('mode');
  }

  get diff() {
    return this.modeForm.get('diff');
  }

  onSubmit(): void {
    console.log(this.modeForm.value);
    this.router.navigate(['/game',{queryParameter : {mode: this.mode, diff: this.diff}}]);

  }
}