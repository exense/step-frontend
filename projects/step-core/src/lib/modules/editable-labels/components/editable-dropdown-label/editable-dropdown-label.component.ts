import {
  Component,
  computed,
  contentChild,
  ElementRef,
  forwardRef,
  input,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { EditableComponent } from '../editable-component/editable.component';
import { EDITABLE_LABELS_COMMON_IMPORTS } from '../../types/editable-labels-common-imports.constant';
import { EditableActionsComponent } from '../editable-actions/editable-actions.component';
import { EditableListItemTemplateDirective } from '../../directives/editable-list-item-template.directive';

type ItemTemplateRef<T> = TemplateRef<{ $implicit: T }>;

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
  imports: [...EDITABLE_LABELS_COMMON_IMPORTS, EditableActionsComponent],
})
export class EditableDropdownLabelComponent<T> extends EditableComponent<T> {
  @Input() items!: T[];

  /** @Input('itemTemplate') **/
  itemTemplateInput = input<ItemTemplateRef<T> | undefined>(undefined, {
    alias: 'itemTemplate',
  });

  /** @ContentChild(EditableListItemTemplateDirective) **/
  private itemTemplateDirective = contentChild(EditableListItemTemplateDirective);

  @ViewChild(MatSelect, { read: ElementRef }) matSelectElementRef?: ElementRef<HTMLElement>;
  @ViewChild(MatSelect) matSelect?: MatSelect;

  readonly itemTemplate = computed(
    () => (this.itemTemplateDirective()?.templateRef as ItemTemplateRef<T>) ?? this.itemTemplateInput(),
  );

  /** @Input() **/
  readonly useUnsetItem = input(false);

  protected override onValueChange(value: T): void {
    super.onValueChange(value);
    this.focusedElement = this.matSelectElementRef!.nativeElement;
    this.onApply();
  }

  protected override onLabelClick(): void {
    if (this.isDisabled) {
      return;
    }
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
