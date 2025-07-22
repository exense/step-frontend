import { Component, inject, ViewEncapsulation } from '@angular/core';
import { BaseEditorComponent } from '../base-editor/base-editor.component';
import { RANGE_MINUTES, RANGE_SECONDS } from '../../injectables/ranges.tokens';

@Component({
  selector: 'step-minutes-editor',
  templateUrl: './minutes-editor.component.html',
  styleUrls: ['./minutes-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class MinutesEditorComponent extends BaseEditorComponent {
  readonly _MINUTES = inject(RANGE_MINUTES);
  readonly _SECONDS = inject(RANGE_SECONDS);

  protected minute = this._MINUTES[0].key;
  protected second = this._SECONDS[0].key;

  protected handleMinuteChange(minute: number): void {
    this.minute = minute;
    this.updateExpression();
  }

  protected handleSecondChange(second: number): void {
    this.second = second;
    this.updateExpression();
  }

  protected override getExpression(): string {
    return `${this.second} 0/${this.minute} * 1/1 * ? *`;
  }
}
