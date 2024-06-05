import { BaseTimeConverterComponent } from './base-time-converter.component';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { NgControl } from '@angular/forms';
import { TimeConvertersFactoryService } from '../../injectables/time-converters-factory.service';

@Component({
  selector: 'step-per-time-unit-input',
  templateUrl: './base-time-converter.component.html',
  styleUrls: ['./base-time-converter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PerTimeUnitInputComponent extends BaseTimeConverterComponent {
  protected override separator = 'per';

  protected override timeConverter = inject(TimeConvertersFactoryService).perTimeConverter();

  constructor(_ngControl: NgControl) {
    super(_ngControl);
  }
}
