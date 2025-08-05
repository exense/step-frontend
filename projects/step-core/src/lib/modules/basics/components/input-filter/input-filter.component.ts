import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, filter, merge, Observable, of } from 'rxjs';
import { BaseFilterComponent } from '../base-filter/base-filter.component';

@Component({
  selector: 'step-input-filter',
  templateUrl: './input-filter.component.html',
  styleUrls: ['./input-filter.component.scss'],
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => InputFilterComponent),
    },
  ],
  standalone: false,
})
export class InputFilterComponent extends BaseFilterComponent<string> implements OnChanges {
  @Input() externalSearchValue?: string;

  ngOnChanges(changes: SimpleChanges): void {
    const cExternalSearchValue = changes['externalSearchValue'];
    if (
      cExternalSearchValue?.previousValue !== cExternalSearchValue?.currentValue &&
      cExternalSearchValue?.firstChange
    ) {
      const value = cExternalSearchValue?.currentValue;
      if (value) {
        this.filterControl.setValue(value);
      }
    }
  }

  protected override createControlChangeStream(control: FormControl<string>): Observable<string> {
    const initialValue$ = of(control.value).pipe(filter((value) => !!value));
    const valueChanges$ = control.valueChanges.pipe(debounceTime(200));
    return merge(initialValue$, valueChanges$);
  }

  protected override handleChange(value: string): void {
    if (this.filterControl.invalid) {
      return;
    }
    super.handleChange(value);
  }

  protected createControl(fb: FormBuilder): FormControl<string> {
    return fb.nonNullable.control('');
  }
}
