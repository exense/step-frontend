import { Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { PopoverOverlayService } from '../../../basics/step-basics.module';
import { DateField } from '../../types/date-field';
import { DatePickerContentComponent } from '../date-picker-content/date-picker-content.component';
import { DateFieldContainerService } from '../../injectables/date-field-container.service';
import { STEP_DATE_TIME_FORMAT_PROVIDERS } from '../../injectables/step-date-format-config.providers';
import { TimeRange } from '../../types/time-range';
import { TimeOption } from '../../types/time-option';

@Component({
  selector: 'step-date-picker',
  template: '',
  encapsulation: ViewEncapsulation.None,
  exportAs: 'DatePicker',
  providers: [...STEP_DATE_TIME_FORMAT_PROVIDERS, DateFieldContainerService, PopoverOverlayService],
  standalone: false,
})
export class DatePickerComponent {
  private _popoverOverlay = inject<PopoverOverlayService<DatePickerContentComponent>>(PopoverOverlayService);
  private _fieldContainer = inject(DateFieldContainerService);

  @Input() xPosition: 'start' | 'end' = 'start';
  @Input() yPosition: 'above' | 'below' = 'below';
  @Input() relativeRangeOptions?: TimeOption[];

  registerInput(dateField: DateField<unknown>): void {
    this._fieldContainer.register(dateField);
  }

  open(): void {
    const xPosition = this.xPosition;
    const yPosition = this.yPosition;
    const createdComponent: DatePickerContentComponent = this._popoverOverlay
      .setPositions({ xPosition, yPosition })
      .open(DatePickerContentComponent, this._fieldContainer.getConnectedOverlayOrigin()?.nativeElement)
      .getComponent()!;
    createdComponent.customRelativeRangeOptions = this.relativeRangeOptions;
  }

  close(): void {
    this._popoverOverlay.close();
  }
}
