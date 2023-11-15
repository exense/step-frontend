import { Component, ViewEncapsulation } from '@angular/core';
import { HoursEditorComponent } from '../hours-editor/hours-editor.component';

@Component({
  selector: 'step-every-day-editor',
  templateUrl: './every-day-editor.component.html',
  styleUrls: ['./every-day-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
})
export class EveryDayEditorComponent extends HoursEditorComponent {
  override readonly HOURS = this.createRange(23, 1).map((key) => ({ key, value: key.toString().padStart(2, '0') }));

  readonly DAYS = this.createRange(31, 1).map((key) => ({ key, value: key.toString() }));

  protected day = this.DAYS[0].key;

  protected handleDayChange(value: number): void {
    this.day = value;
    this.updateExpression();
  }

  protected override getExpression(): string {
    return `${this.second} ${this.minute} ${this.hour} 1/${this.day} * ? *`;
  }
}
