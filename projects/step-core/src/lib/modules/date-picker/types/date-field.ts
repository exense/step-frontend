import { ElementRef } from '@angular/core';
import { DateAdapterService } from '../injectables/date-adapter.service';
import { TimeOption } from './time-option';

export interface DateField<D> {
  getConnectedOverlayOrigin(): ElementRef | undefined;
  getModel(): D | undefined | null;
  setModel(date?: D | null): void;
  isFieldDisabled(): boolean;
  isRangeField(): boolean;
  withTime(): boolean;
  withRelativeTime(): boolean;
  dateAdapter(): DateAdapterService<D> | undefined;
  handleRelativeOptionChange(timeOption?: TimeOption): void;
}
