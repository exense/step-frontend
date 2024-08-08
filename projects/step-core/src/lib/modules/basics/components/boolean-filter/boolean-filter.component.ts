import { Component, forwardRef } from '@angular/core';
import { BaseFilterComponent } from '../base-filter/base-filter.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'step-boolean-filter',
  templateUrl: './boolean-filter.component.html',
  styleUrl: './boolean-filter.component.scss',
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => BooleanFilterComponent),
    },
  ],
})
export class BooleanFilterComponent extends BaseFilterComponent<boolean[]> {
  protected createControl(fb: FormBuilder): FormControl<boolean[]> {
    return fb.nonNullable.control([]);
  }
  protected createControlChangeStream(control: FormControl<boolean[]>): Observable<boolean[]> {
    return control.valueChanges;
  }
}
