import {
  ChangeDetectorRef,
  Component,
  computed,
  contentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  input,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { Mutable } from '../../../basics/step-basics.module';
import { EditableLabelTemplateDirective } from '../../directives/editable-label-template.directive';

export enum EditableComponentState {
  READABLE,
  EDITABLE,
}

type OnChange = <T>(value?: T) => void;
type OnTouch = () => void;
type LabelTemplateAccessor = Mutable<Pick<EditableComponent<any>, 'labelTemplate'>>;

// The @Component() decorator allows us to use decorators like @HostListener() in our base classes
@Component({
  // The provided template in our case is irrelevant
  template: '',
  standalone: false,
})
export abstract class EditableComponent<T> implements ControlValueAccessor {
  protected _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected _changeDetectorRef = inject(ChangeDetectorRef);
  protected _document = inject(DOCUMENT);

  /** @Input('labelTemplate') **/
  labelTemplateInput = input<TemplateRef<{}> | undefined>(undefined, {
    alias: 'labelTemplate',
  });

  @Input() tooltip: string = '';

  @Output() stateChange = new EventEmitter<EditableComponentState>();

  /** @ContentChild(EditableLabelTemplateDirective) **/
  private labelTemplateDirective = contentChild(EditableLabelTemplateDirective);

  readonly labelTemplate = computed(() => this.labelTemplateDirective()?.templateRef ?? this.labelTemplateInput()!);

  protected readonly State = EditableComponentState;

  protected onChange?: OnChange;
  protected onTouch?: OnTouch;
  protected focusedElement?: HTMLElement;
  protected value?: T;
  protected newValue?: T;

  protected state = EditableComponentState.READABLE;

  @HostBinding('class.disabled')
  protected isDisabled = false;

  writeValue(value: T): void {
    this.value = value;
    this.newValue = value;
  }

  registerOnChange(onChange: OnChange): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch: OnTouch): void {
    this.onTouch = onTouch;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  @HostListener('window:keydown.esc')
  protected onEscape(): void {
    this.onCancel();
  }

  @HostListener('window:keydown.enter')
  protected onEnter(): void {
    if (this._document.activeElement !== this.focusedElement) {
      return;
    }

    this.onApply();
  }

  @HostListener('window:click', ['$event'])
  protected onWindowClick(event: Event): void {
    if (this._document.activeElement === this.focusedElement) {
      return;
    }

    if (this.state === EditableComponentState.READABLE) {
      return;
    }

    const target = event.target as HTMLElement;
    const isChildOfHost = this._elementRef.nativeElement.contains(target);

    if (isChildOfHost) {
      return;
    }

    this.onApply();
  }

  protected onLabelClick(): void {
    if (this.isDisabled) {
      return;
    }
    this.state = EditableComponentState.EDITABLE;
    this.stateChange.emit(this.state);
    this.newValue = this.value;
    this._changeDetectorRef.detectChanges();
  }

  protected onCancel(): void {
    this.state = EditableComponentState.READABLE;
    this.stateChange.emit(this.state);
    delete this.newValue;
  }

  protected onApply(): void {
    this.state = EditableComponentState.READABLE;
    this.stateChange.emit(this.state);

    if (this.newValue === this.value) {
      return;
    }

    this.value = this.newValue;
    this.onChange?.(this.value);
  }

  protected onValueChange(value: T): void {
    this.newValue = value;
  }

  protected onBlur(): void {
    this.onTouch?.();
    delete this.focusedElement;
  }
}
