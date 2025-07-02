import { Component, inject, ViewEncapsulation } from '@angular/core';
import { HoursEditorComponent } from '../hours-editor/hours-editor.component';
import { RANGE_DAYS } from '../../injectables/ranges.tokens';

@Component({
  selector: 'step-every-day-editor',
  templateUrl: './every-day-editor.component.html',
  styleUrls: ['./every-day-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class EveryDayEditorComponent extends HoursEditorComponent {
  readonly _DAYS = inject(RANGE_DAYS);

  protected override hour = 0;
  protected day = this._DAYS[0].key;

  protected handleDayChange(value: number): void {
    this.day = value;
    this.updateExpression();
  }

  protected override getExpression(): string {
    return `${this.second} ${this.minute} ${this.hour} 1/${this.day} * ? *`;
  }
}
