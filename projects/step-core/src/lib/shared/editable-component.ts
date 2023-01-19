import { Component, ElementRef, HostListener, Input, TemplateRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { isChildOf } from './utils';

export enum EditableComponentState {
  READABLE,
  EDITABLE,
}

type OnChange = <T>(value?: T) => void;
type OnTouch = () => void;

// The @Component() decorator allows us to use decorators like @HostListener() in our base classes
@Component({
  // the template provided is irrelevant in our case
  template: '',
})
export abstract class EditableComponent<T> implements ControlValueAccessor {
  @Input() labelTemplate!: TemplateRef<{}>;

  protected readonly State = EditableComponentState;

  protected onChange?: OnChange;
  protected onTouch?: OnTouch;
  protected focusedElement?: HTMLElement;

  protected state = EditableComponentState.READABLE;
  protected isDisabled = false;

  protected constructor(protected elementRef: ElementRef<HTMLElement>) {}

  abstract writeValue(value: T): void;

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
    if (document.activeElement !== this.focusedElement) {
      return;
    }

    this.onApply();
  }

  @HostListener('window:click', ['$event'])
  protected onWindowClick(event: Event): void {
    if (document.activeElement === this.focusedElement) {
      return;
    }

    if (this.state === EditableComponentState.READABLE) {
      return;
    }

    const target = event.target as HTMLElement;
    const isChildOfHost = isChildOf({
      parent: this.elementRef.nativeElement,
      searchElement: target,
    });

    if (isChildOfHost) {
      return;
    }

    this.onApply();
  }

  protected abstract onCancel(): void;

  protected abstract onApply(): void;
}
