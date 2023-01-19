import { ChangeDetectorRef, Component, ElementRef, forwardRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { EditableComponent, EditableComponentState } from '../../shared/editable-component';

@Component({
  selector: 'step-editable-dropdown-label',
  templateUrl: './editable-dropdown-label.component.html',
  styleUrls: ['./editable-dropdown-label.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditableDropdownLabelComponent),
      multi: true,
    },
  ],
})
export class EditableDropdownLabelComponent<T> extends EditableComponent<T> {
  @Input() items!: T[];
  @Input() itemTemplate!: TemplateRef<{
    $implicit: T;
  }>;

  @ViewChild(MatSelect, { read: ElementRef }) matSelectElementRef?: ElementRef<HTMLElement>;

  value?: T;
  newValue?: T;

  constructor(protected override elementRef: ElementRef<HTMLElement>, private changeDetectorRef: ChangeDetectorRef) {
    super(elementRef);
  }

  override writeValue(value: T): void {
    this.value = value;
  }

  protected override onCancel(): void {
    this.state = EditableComponentState.READABLE;
    delete this.newValue;
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
    this.matSelectElementRef!.nativeElement.click();
    this.focusedElement = this.matSelectElementRef!.nativeElement;
  }

  onValueChange(value: T): void {
    this.newValue = value;
    this.focusedElement = this.matSelectElementRef!.nativeElement;
  }

  onOpenedChange(opened: boolean): void {
    if (opened) {
      return;
    }

    this.onTouch?.();
    delete this.focusedElement;
  }
}
