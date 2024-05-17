import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { DateField } from '../types/date-field';
import { DateAdapterService } from './date-adapter.service';
import { TimeOption } from '../types/time-option';

@Injectable()
export class DateFieldContainerService<D> implements DateField<D>, OnDestroy {
  private dateField?: DateField<D>;

  register(dateField?: DateField<D>): void {
    this.dateField = dateField;
  }

  getConnectedOverlayOrigin(): ElementRef<any> | undefined {
    return this.dateField?.getConnectedOverlayOrigin();
  }

  getModel(): D | undefined | null {
    return this.dateField?.getModel();
  }

  setModel(date?: D | null): void {
    this.dateField?.setModel(date);
  }

  isFieldDisabled(): boolean {
    return !!this.dateField?.isFieldDisabled();
  }

  isRangeField(): boolean {
    return !!this.dateField?.isRangeField();
  }

  dateAdapter(): DateAdapterService<D> | undefined {
    return this.dateField?.dateAdapter();
  }

  withTime(): boolean {
    return !!this.dateField?.withTime();
  }

  withRelativeTime(): boolean {
    return !!this.dateField?.withRelativeTime();
  }

  handleRelativeOptionChange(timeOption?: TimeOption): void {
    this.dateField?.handleRelativeOptionChange(timeOption);
  }

  ngOnDestroy(): void {
    this.dateField = undefined;
  }
}
