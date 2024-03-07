import { Component, ElementRef, forwardRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { EditableComponent } from '../editable-component/editable.component';
import { EDITABLE_LABELS_COMMON_IMPORTS } from '../../types/editable-labels-common-imports.constant';
import { EditableActionsComponent } from '../editable-actions/editable-actions.component';

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
  standalone: true,
  imports: [...EDITABLE_LABELS_COMMON_IMPORTS, EditableActionsComponent],
})
export class EditableDropdownLabelComponent<T> extends EditableComponent<T> {
  @Input() items!: T[];
  @Input() itemTemplate!: TemplateRef<{
    $implicit: T;
  }>;

  @ViewChild(MatSelect, { read: ElementRef }) matSelectElementRef?: ElementRef<HTMLElement>;
  @ViewChild(MatSelect) matSelect?: MatSelect;

  protected override onValueChange(value: T): void {
    super.onValueChange(value);
    this.focusedElement = this.matSelectElementRef!.nativeElement;
  }

  protected override onLabelClick(): void {
    super.onLabelClick();
    this.focusedElement = this.matSelectElementRef!.nativeElement;
    this.focusedElement.focus();
    this.matSelect?.open();
  }

  onOpenedChange(opened: boolean): void {
    if (opened) {
      return;
    }

    super.onBlur();
  }
}
