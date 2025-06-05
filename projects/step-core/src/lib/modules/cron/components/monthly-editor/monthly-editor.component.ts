import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';

enum MonthlyType {
  DAY = 'day',
  WEEK_DAY = 'week_day',
}

@Component({
  selector: 'step-monthly-editor',
  templateUrl: './monthly-editor.component.html',
  styleUrls: ['./monthly-editor.component.scss'],
  host: {
    class: 'editors-group',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class MonthlyEditorComponent {
  @Output() expressionChange = new EventEmitter<string>();

  readonly MonthlyType = MonthlyType;

  protected selected = MonthlyType.DAY;
}
