import { Component, ViewEncapsulation } from '@angular/core';
import { HoursEditorComponent } from '../hours-editor/hours-editor.component';

@Component({
  selector: 'step-weekly-editor',
  templateUrl: './weekly-editor.component.html',
  styleUrls: ['./weekly-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class WeeklyEditorComponent extends HoursEditorComponent {
  protected selectedDays: string[] = [];

  protected override hour = 0;

  protected handleSelectedDayChange(selectedDays: string[]): void {
    this.selectedDays = selectedDays;
    this.updateExpression();
  }

  protected override getExpression(): string {
    const days = this.selectedDays.join(',');
    return `${this.second} ${this.minute} ${this.hour} ? * ${!days ? '*' : `${days} *`}`;
  }
}
