import { Component, ElementRef, forwardRef, inject, viewChild, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditableComponent, EditableComponentState } from '../editable-component/editable.component';
import { EDITABLE_LABELS_COMMON_IMPORTS } from '../../types/editable-labels-common-imports.constant';
import { EditableActionsComponent } from '../editable-actions/editable-actions.component';
import { TextSerializeService } from '../../injectables/text-serialize.service';

const DEFAULT_TEXTAREA_ROWS = 4;
const LINE_HEIGHT = 18;
const PADDING_TOP_BOTTOM = 8;
const BORDER_WIDTH = 1;

@Component({
  selector: 'step-editable-textarea-label',
  templateUrl: './editable-textarea-label.component.html',
  styleUrls: ['./editable-textarea-label.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditableTextareaLabelComponent),
      multi: true,
    },
  ],
  imports: [...EDITABLE_LABELS_COMMON_IMPORTS, EditableActionsComponent],
  encapsulation: ViewEncapsulation.None,
})
export class EditableTextareaLabelComponent extends EditableComponent<string> {
  private _textSerialize = inject(TextSerializeService);

  private textarea = viewChild<ElementRef<HTMLElement>>('textarea');

  textareaRows = DEFAULT_TEXTAREA_ROWS;

  protected override onCancel(): void {
    this.value = this._textSerialize.serializeValue(this.value);
    super.onCancel();
  }

  protected override onLabelClick(): void {
    if (this.isDisabled) {
      return;
    }
    this.recalculateTextareaRows();
    this.value = this._textSerialize.deserializeValue(this.value);
    super.onLabelClick();
    this.textarea()?.nativeElement?.focus?.();
    this.focusedElement = this.textarea()?.nativeElement;
  }

  protected override onEnter(): void {
    // do nothing
  }

  override writeValue(value: string): void {
    this.value = this._textSerialize.serializeValue(value);
    this.newValue = this.value;
  }

  protected override onApply(): void {
    this.state = EditableComponentState.READABLE;
    this.stateChange.emit(this.state);

    if (this.newValue === this.value) {
      this.value = this._textSerialize.serializeValue(this.value);
      return;
    }

    this.value = this._textSerialize.serializeValue(this.newValue);
    this.onChange?.(this._textSerialize.undecorateLine(this.value));
  }

  onInput(): void {
    const nativeElement = this.textarea()?.nativeElement;
    if (!nativeElement) {
      return;
    }
    nativeElement.style.setProperty('height', `0`);
    nativeElement.style.setProperty('height', `${nativeElement.scrollHeight + 2 * BORDER_WIDTH}px`);
  }

  private recalculateTextareaRows(): void {
    const { height } = this._elementRef.nativeElement.getBoundingClientRect();

    this.textareaRows = (height - 2 * PADDING_TOP_BOTTOM) / LINE_HEIGHT;
  }
}
