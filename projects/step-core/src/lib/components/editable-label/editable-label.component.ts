import { ChangeDetectorRef, Component, ElementRef, forwardRef, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditableComponent, EditableComponentState } from '../../shared/editable-component';

@Component({
  selector: 'step-editable-label',
  templateUrl: './editable-label.component.html',
  styleUrls: ['./editable-label.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditableLabelComponent),
      multi: true,
    },
  ],
})
export class EditableLabelComponent extends EditableComponent<string> {
  @ViewChild('input') input?: ElementRef<HTMLElement>;

  value = '';
  newValue = '';

  constructor(protected override elementRef: ElementRef<HTMLElement>, private changeDetectorRef: ChangeDetectorRef) {
    super(elementRef);
  }

  override writeValue(value: string): void {
    this.value = value;
  }

  protected override onCancel(): void {
    this.state = EditableComponentState.READABLE;
    this.newValue = '';
  }

  protected override onApply(): void {
    this.state = EditableComponentState.READABLE;
    this.value = this.newValue;
    this.onChange?.(this.newValue);
  }

  onLabelClick(): void {
    this.state = EditableComponentState.EDITABLE;
    this.newValue = this.value;
    this.changeDetectorRef.detectChanges();
    this.input!.nativeElement.focus();
    this.focusedElement = this.input!.nativeElement;
  }

  onValueChange(value: string): void {
    this.newValue = value;
  }

  onBlur(): void {
    delete this.focusedElement;
    this.onTouch?.();
  }
}
