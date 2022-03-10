import { FormGroup, AbstractControl } from "@angular/forms";

export function diffValidator(

  mode: string,

  diff: string

) {

  return (formGroup: FormGroup) => {

    const modeControl = formGroup.controls[mode];

    const diffControl = formGroup.controls[diff];


    if (diffControl.errors && !diffControl.errors['mustChoose']) {

      return;

    }


    if (modeControl.value == 'AI' && diffControl.value == '') {

      diffControl.setErrors({ mustChoose: true });

    } else {

      diffControl.setErrors(null);

    }

  };

}