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
  standalone: false,
})
export class EveryWeekDayEditorComponent extends HoursEditorComponent {
  protected override hour = 0;

  protected override getExpression(): string {
    return `${this.second} ${this.minute} ${this.hour} ? * MON-FRI *`;
  }
}
