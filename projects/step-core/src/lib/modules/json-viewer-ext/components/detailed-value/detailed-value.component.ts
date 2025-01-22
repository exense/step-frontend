import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AceMode, RichEditorDialogService } from '../../../rich-editor';

@Component({
  selector: 'step-detailed-value',
  standalone: true,
  imports: [],
  templateUrl: './detailed-value.component.html',
  styleUrl: './detailed-value.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailedValueComponent {
  private _richEditorDialog = inject(RichEditorDialogService);

  /** @Input() **/
  readonly value = input.required<string>();

  protected openDetailedInfo(): void {
    const value = this.value();
    this._richEditorDialog.editText(value, {
      isReadOnly: true,
      title: '',
      predefinedMode: AceMode.TEXT,
      wrapText: true,
    });
  }
}
