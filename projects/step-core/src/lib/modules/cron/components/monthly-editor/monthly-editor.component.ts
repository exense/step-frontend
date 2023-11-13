import { AfterViewInit, Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { ExpressionChangeEvent } from '../base-editor/base-editor.component';

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
})
export class MonthlyEditorComponent implements AfterViewInit {
  @Output() expressionChange = new EventEmitter<ExpressionChangeEvent>();

  readonly MonthlyType = MonthlyType;

  protected selected?: MonthlyType;

  ngAfterViewInit(): void {
    this.expressionChange.emit({ expression: '', isTouched: false });
  }
}
