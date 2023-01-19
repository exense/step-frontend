import { ChangeDetectorRef, Component, ElementRef, forwardRef, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditableComponent } from '../../shared/editable-component';

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

  constructor(
    protected override elementRef: ElementRef<HTMLElement>,
    protected override changeDetectorRef: ChangeDetectorRef
  ) {
    super(elementRef, changeDetectorRef);
  }

  protected override onCancel(): void {
    super.onCancel();
    this.recalculateTextareaRows();
  }

  protected override onLabelClick(): void {
    this.recalculateTextareaRows();
    super.onLabelClick();
    this.textarea!.nativeElement.focus();
    this.focusedElement = this.textarea!.nativeElement;
  }

  onInput(): void {
    this.textarea!.nativeElement.style.setProperty('height', `0`);
    this.textarea!.nativeElement.style.setProperty(
      'height',
      `${this.textarea!.nativeElement.scrollHeight + 2 * BORDER_WIDTH}px`
    );
  }

  private recalculateTextareaRows(): void {
    const { height } = this.elementRef.nativeElement.getBoundingClientRect();

    this.textareaRows = (height - 2 * PADDING_TOP_BOTTOM) / LINE_HEIGHT;
  }
}
