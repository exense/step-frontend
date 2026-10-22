import { Component, forwardRef, input, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { filter, merge, Observable, of } from 'rxjs';
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
export class InputFilterComponent extends BaseFilterComponent<string> implements OnInit {
  readonly externalSearchValue = input<string>();

  override ngOnInit(): void {
    const value = this.externalSearchValue();
    if (value) {
      this.filterControl.setValue(value);
    }
    super.ngOnInit();
  }

  protected override createControlChangeStream(control: FormControl<string>): Observable<string> {
    const initialValue$ = of(control.value).pipe(filter((value) => !!value));
    return merge(initialValue$, control.valueChanges);
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
