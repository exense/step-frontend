import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'step-timeseries-compare-mode',
  templateUrl: './compare-mode.component.html',
  styleUrls: ['./compare-mode.component.scss'],
})
export class TsCompareModeComponent {
  @Output() onEnabledChange = new EventEmitter<boolean>();

  enabled = false;

  toggleEnabled(): void {
    this.enabled = !this.enabled;
    this.onEnabledChange.emit(this.enabled);
  }
}
