import { Component, ElementRef, forwardRef, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditableComponent, EditableComponentState } from '../../shared/editable-component';

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
})
export class EditableTextareaLabelComponent extends EditableComponent<string> {
  @ViewChild('textarea') textarea?: ElementRef<HTMLElement>;

  textareaRows = DEFAULT_TEXTAREA_ROWS;

  protected override onCancel(): void {
    this.value = this.serializeValue(this.value);
    super.onCancel();
  }

  protected override onLabelClick(): void {
    this.recalculateTextareaRows();
    this.value = this.deserializeValue(this.value);
    super.onLabelClick();
    this.textarea!.nativeElement.focus();
    this.focusedElement = this.textarea!.nativeElement;
  }

  protected override onEnter(): void {
    // do nothing
  }

  override writeValue(value: string): void {
    this.value = this.serializeValue(value);
    this.newValue = this.value;
  }

  protected override onApply(): void {
    this.state = EditableComponentState.READABLE;
    this.stateChange.emit(this.state);

    if (this.newValue === this.value) {
      this.value = this.serializeValue(this.value);
      return;
    }

    this.value = this.serializeValue(this.newValue);
    this.onChange?.(this.value);
  }

  onInput(): void {
    this.textarea!.nativeElement.style.setProperty('height', `0`);
    this.textarea!.nativeElement.style.setProperty(
      'height',
      `${this.textarea!.nativeElement.scrollHeight + 2 * BORDER_WIDTH}px`
    );
  }

  private recalculateTextareaRows(): void {
    const { height } = this._elementRef.nativeElement.getBoundingClientRect();

    this.textareaRows = (height - 2 * PADDING_TOP_BOTTOM) / LINE_HEIGHT;
  }

  private deserializeValue(value?: string): string {
    let deserializedValue = value ? value.replace(/<br \/>/g, '\n') : '';

    if (deserializedValue.endsWith('\n')) {
      deserializedValue = deserializedValue.replace(/\n$/g, '');
    }

    return deserializedValue;
  }

  private serializeValue(value?: string): string {
    let serializedValue = value ? value.replace(/\n/g, '<br />') : '';

    if (serializedValue.endsWith('<br />')) {
      serializedValue += '<br />';
    }

    return serializedValue;
  }
}
