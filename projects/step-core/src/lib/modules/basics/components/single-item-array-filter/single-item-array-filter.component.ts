import { Component, forwardRef } from '@angular/core';
import { ArrayFilterComponent } from '../array-filter/array-filter.component';
import { BaseFilterComponent } from '../base-filter/base-filter.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'step-single-item-array-filter',
  templateUrl: './single-item-array-filter.component.html',
  styleUrls: ['./single-item-array-filter.component.scss'],
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => SingleItemArrayFilterComponent),
    },
  ],
  standalone: false,
})
export class SingleItemArrayFilterComponent extends ArrayFilterComponent {
  protected override createControl(fb: FormBuilder): FormControl<unknown> {
    return fb.nonNullable.control('');
  }

  protected override createControlChangeStream(control: FormControl<unknown>): Observable<string> {
    return control.valueChanges.pipe(
      map((value: unknown) => {
        return (value as string) ?? '';
      }),
    );
  }

  protected override transformFilterValueToControlValue(value?: string): unknown {
    return value;
  }
}
