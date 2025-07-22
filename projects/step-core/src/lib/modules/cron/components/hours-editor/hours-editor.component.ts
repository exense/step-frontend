import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MinutesEditorComponent } from '../minutes-editor/minutes-editor.component';
import { RANGE_HOURS } from '../../injectables/ranges.tokens';

@Component({
  selector: 'step-hours-editor',
  templateUrl: './hours-editor.component.html',
  styleUrls: ['./hours-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class HoursEditorComponent extends MinutesEditorComponent {
  readonly _HOURS = inject(RANGE_HOURS);

  protected override minute = 0;

  protected hour = this._HOURS[0].key;

  handleHourChange(hour: number): void {
    this.hour = hour;
    this.updateExpression();
  }

  protected override getExpression(): string {
    return `${this.second} ${this.minute} 0/${this.hour} 1/1 * ? *`;
  }
}
