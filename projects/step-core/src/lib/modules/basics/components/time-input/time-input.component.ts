import { Component, inject, ViewEncapsulation } from '@angular/core';
import { BaseTimeConverterComponent } from './base-time-converter.component';
import { NgControl } from '@angular/forms';
import { TimeConvertersFactoryService } from '../../injectables/time-converters-factory.service';

@Component({
  selector: 'step-time-input',
  templateUrl: './base-time-converter.component.html',
  styleUrls: ['./base-time-converter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TimeInputComponent extends BaseTimeConverterComponent {
  protected override timeConverter = inject(TimeConvertersFactoryService).timeConverter();

  constructor(_ngControl: NgControl) {
    super(_ngControl);
  }
}
