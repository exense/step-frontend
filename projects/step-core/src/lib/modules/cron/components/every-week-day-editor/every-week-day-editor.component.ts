import { Component, ViewEncapsulation } from '@angular/core';
import { HoursEditorComponent } from '../hours-editor/hours-editor.component';

@Component({
  selector: 'step-every-week-day-editor',
  templateUrl: './every-week-day-editor.component.html',
  styleUrls: ['./every-week-day-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
})
export class EveryWeekDayEditorComponent extends HoursEditorComponent {
  override readonly HOURS = this.createRange(23, 1).map((key) => ({ key, value: key.toString().padStart(2, '0') }));

  protected override getExpression(): string {
    return `${this.second} ${this.minute} ${this.hour} ? * MON-FRI *`;
  }
}
