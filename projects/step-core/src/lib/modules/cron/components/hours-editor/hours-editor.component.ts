import { Component, ViewEncapsulation } from '@angular/core';
import { MinutesEditorComponent } from '../minutes-editor/minutes-editor.component';

@Component({
  selector: 'step-hours-editor',
  templateUrl: './hours-editor.component.html',
  styleUrls: ['./hours-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
})
export class HoursEditorComponent extends MinutesEditorComponent {
  override readonly MINUTES = this.SECONDS;

  readonly HOURS = this.createRange(23, 1).map((key) => ({ key, value: key.toString() }));

  protected override minute = this.MINUTES[0].key;

  protected hour = this.HOURS[0].key;

  handleHourChange(hour: number): void {
    this.hour = hour;
    this.updateExpression();
  }

  protected override getExpression(): string {
    return `${this.second} ${this.minute} 0/${this.hour} 1/1 * ? *`;
  }
}
