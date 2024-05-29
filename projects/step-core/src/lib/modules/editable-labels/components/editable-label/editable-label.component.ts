import { Component, ElementRef, forwardRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditableComponent } from '../editable-component/editable.component';
import { EDITABLE_LABELS_COMMON_IMPORTS } from '../../types/editable-labels-common-imports.constant';
import { EditableActionsComponent } from '../editable-actions/editable-actions.component';
import { DynamicInputWidthDirective } from '../../directives/dynamic-input-width.directive';

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
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [...EDITABLE_LABELS_COMMON_IMPORTS, EditableActionsComponent, DynamicInputWidthDirective],
})
export class EditableLabelComponent extends EditableComponent<string> {
  @ViewChild('input') input?: ElementRef<HTMLElement>;

  protected override onLabelClick(): void {
    if (this.isDisabled) {
      return;
    }
    super.onLabelClick();
    this.input!.nativeElement.focus();
    this.focusedElement = this.input!.nativeElement;
  }
}
