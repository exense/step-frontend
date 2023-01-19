import { ChangeDetectorRef, Component, ElementRef, forwardRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { EditableComponent } from '../../shared/editable-component';

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

  constructor(
    protected override elementRef: ElementRef<HTMLElement>,
    protected override changeDetectorRef: ChangeDetectorRef
  ) {
    super(elementRef, changeDetectorRef);
  }

  protected override onValueChange(value: T): void {
    super.onValueChange(value);
    this.focusedElement = this.matSelectElementRef!.nativeElement;
  }

  protected override onLabelClick(): void {
    super.onLabelClick();
    this.matSelectElementRef!.nativeElement.click();
    this.focusedElement = this.matSelectElementRef!.nativeElement;
  }

  onOpenedChange(opened: boolean): void {
    if (opened) {
      return;
    }

    super.onBlur();
  }
}
