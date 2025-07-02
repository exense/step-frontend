import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';

enum DailyType {
  EVERY_DAY = 'every_day',
  EVERY_WEEK_DAY = 'every_week_day',
}

@Component({
  selector: 'step-daily-editor',
  templateUrl: './daily-editor.component.html',
  styleUrls: ['./daily-editor.component.scss'],
  host: {
    class: 'editors-group',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class DailyEditorComponent {
  @Output() expressionChange = new EventEmitter<string>();

  readonly DailyType = DailyType;

  protected selected = DailyType.EVERY_DAY;
}
