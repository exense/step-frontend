import { InputFilterComponent } from './input-filter.component';
import { Component, forwardRef } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { BaseFilterComponent } from '../base-filter/base-filter.component';

const HEXADECIMAL_REGEXP = /^[0-9a-f]{24}$/;

@Component({
  selector: 'step-hexadecimal-input-filter',
  templateUrl: './input-filter.component.html',
  styleUrls: ['./input-filter.component.scss'],
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => HexadecimalInputFilterComponent),
    },
  ],
  standalone: false,
})
export class HexadecimalInputFilterComponent extends InputFilterComponent {
  protected override createControl(fb: FormBuilder): FormControl<string> {
    return fb.nonNullable.control('', Validators.pattern(HEXADECIMAL_REGEXP));
  }
}
