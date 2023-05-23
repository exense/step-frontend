import { Component, ElementRef, forwardRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditableComponent } from '../../shared/editable-component';

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
})
export class EditableLabelComponent extends EditableComponent<string> {
  @ViewChild('input') input?: ElementRef<HTMLElement>;

  protected override onLabelClick(): void {
    super.onLabelClick();
    this.input!.nativeElement.focus();
    this.focusedElement = this.input!.nativeElement;
  }
}
