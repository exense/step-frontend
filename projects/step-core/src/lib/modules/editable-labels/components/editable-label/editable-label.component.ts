import { Component, ElementRef, forwardRef, viewChild, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditableComponent } from '../editable-component/editable.component';
import { EDITABLE_LABELS_COMMON_IMPORTS } from '../../types/editable-labels-common-imports.constant';
import { EditableActionsComponent } from '../editable-actions/editable-actions.component';
import { StepBasicsModule } from '../../../basics/step-basics.module';

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
  imports: [...EDITABLE_LABELS_COMMON_IMPORTS, EditableActionsComponent, StepBasicsModule],
})
export class EditableLabelComponent extends EditableComponent<string> {
  private input = viewChild<ElementRef<HTMLInputElement>>('input');

  protected override onLabelClick(): void {
    if (this.isDisabled) {
      return;
    }
    super.onLabelClick();
    this.input()?.nativeElement?.focus?.();
    this.focusedElement = this.input()?.nativeElement;
  }
}
