import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

export enum EditableComponentState {
  READABLE,
  EDITABLE,
}

type OnChange = <T>(value?: T) => void;
type OnTouch = () => void;

// The @Component() decorator allows us to use decorators like @HostListener() in our base classes
@Component({
  // The provided template in our case is irrelevant
  template: '',
})
export class EditableComponent<T> implements ControlValueAccessor {
  @Input() labelTemplate!: TemplateRef<{}>;

  @Output() stateChange = new EventEmitter<EditableComponentState>();

  protected readonly State = EditableComponentState;

  protected onChange?: OnChange;
  protected onTouch?: OnTouch;
  protected focusedElement?: HTMLElement;
  protected value?: T;
  protected newValue?: T;

  protected state = EditableComponentState.READABLE;
  protected isDisabled = false;

  protected constructor(
    protected _elementRef: ElementRef<HTMLElement>,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _document: Document
  ) {}

  writeValue(value: T): void {
    this.value = value;
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
    this.value = this.newValue;
    this.onChange?.(this.newValue);
  }

  protected onValueChange(value: T): void {
    this.newValue = value;
  }

  protected onBlur(): void {
    this.onTouch?.();
    delete this.focusedElement;
  }
}
