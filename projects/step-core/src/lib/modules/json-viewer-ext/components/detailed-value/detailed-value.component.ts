import { ChangeDetectionStrategy, Component, ElementRef, inject, input, viewChild } from '@angular/core';
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

  private valueContainer = viewChild<ElementRef<HTMLDivElement>>('valueContainer');

  /** @Input() **/
  readonly value = input.required<string>();

  protected openDetailedInfo($event: MouseEvent): void {
    const valueContainer = this.valueContainer()?.nativeElement;
    if (!valueContainer || valueContainer.getBoundingClientRect().height < 80) {
      return;
    }
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    const value = this.value();
    this._richEditorDialog.editText(value, {
      isReadOnly: true,
      title: '',
      predefinedMode: AceMode.TEXT,
    });
  }
}
