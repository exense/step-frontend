import { Component, Input, Optional, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'step-spinner',
  templateUrl: './step-spinner.component.html',
  styleUrls: ['./step-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepSpinnerComponent implements OnChanges {
  @Input() show: boolean = false;
  @Input() showOnlyOnce: boolean = true;

  suppressSpinner: boolean = false;

  private shownCounter: number = 0;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.showOnlyOnce && !this.suppressSpinner) {
      const showChange = changes['show'];
      if (!!showChange?.currentValue) {
        this.shownCounter++;
        if (this.shownCounter > 1) {
          this.suppressSpinner = true;
        }
      }
    }
  }
}
