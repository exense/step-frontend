import { InputFilterComponent } from './input-filter.component';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

const HEXADECIMAL_REGEXP = /^[0-9a-f]{24}$/;

@Component({
  selector: 'step-hexadecimal-input-filter',
  templateUrl: './input-filter.component.html',
  styleUrls: ['./input-filter.component.scss'],
})
export class HexadecimalInputFilterComponent extends InputFilterComponent {
  constructor(formBuilder: FormBuilder) {
    super(formBuilder);
  }

  protected override createControl(): FormControl {
    return this.formBuilder.control('', Validators.pattern(HEXADECIMAL_REGEXP));
  }
}
