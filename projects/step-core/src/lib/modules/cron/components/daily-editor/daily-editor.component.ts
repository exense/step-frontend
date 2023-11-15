import { AfterViewInit, Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { ExpressionChangeEvent } from '../base-editor/base-editor.component';

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
})
export class DailyEditorComponent implements AfterViewInit {
  @Output() expressionChange = new EventEmitter<ExpressionChangeEvent>();

  readonly DailyType = DailyType;

  protected selected?: DailyType;

  ngAfterViewInit(): void {
    this.expressionChange.emit({ expression: '', isTouched: false });
  }
}
