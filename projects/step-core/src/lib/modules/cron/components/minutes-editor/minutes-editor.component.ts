import { Component, ViewEncapsulation } from '@angular/core';
import { BaseEditorComponent } from '../base-editor/base-editor.component';

@Component({
  selector: 'step-minutes-editor',
  templateUrl: './minutes-editor.component.html',
  styleUrls: ['./minutes-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MinutesEditorComponent extends BaseEditorComponent {
  readonly MINUTES = this.createRange(59, 1).map((key) => ({ key, value: key.toString() }));

  readonly SECONDS = this.createRange(59).map((key) => ({ key, value: key.toString().padStart(2, '0') }));

  protected minute = this.MINUTES[0].key;
  protected second = this.SECONDS[0].key;

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
