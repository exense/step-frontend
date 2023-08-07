import { Component, EventEmitter, HostBinding, inject, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Input as StInput, ScreensService } from '../../client/generated';

export enum InputType {
  TEXT = 'TEXT',
  DROPDOWN = 'DROPDOWN',
  CHECKBOX = 'CHECKBOX',
}

export type OnChange = (value?: string) => void;
export type OnTouch = () => void;

@Component({
  template: '',
})
export abstract class BaseCustomFormInputComponent implements ControlValueAccessor, OnInit {
  @Input() stScreen?: string;
  @Input() stInput?: StInput;
  @Input() stInputId?: string;

  @Output() touch = new EventEmitter<void>();

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  readonly InputType = InputType;

  value?: string;
  @HostBinding('class.disabled') isDisabled?: boolean;
  input?: StInput;
  dropdownItems: string[] = [];
  checkboxItems: string[] = ['true', 'false'];

  protected _screensService = inject(ScreensService);

  ngOnInit(): void {
    if (!this.stInput) {
      this._screensService.getInputForScreen(this.stScreen!, this.stInputId!).subscribe((input) => {
        this.input = input;
        this.initDefaultValue(this.input);
        this.initDropdownItems(this.input);
      });
    } else {
      this.input = this.stInput;
      this.initDefaultValue(this.input);
      this.initDropdownItems(this.input);
    }
  }

  writeValue(value: string): void {
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

  onValueChange(value: string): void {
    this.value = value;
    this.onChange?.(value);
  }

  invokeTouch(): void {
    this.onTouch?.();
    this.touch.emit();
  }

  private initDefaultValue(input: StInput): void {
    if (!input.defaultValue) {
      return;
    }

    this.onValueChange(input.defaultValue);
  }

  private initDropdownItems(input: StInput): void {
    this.dropdownItems = input.options
      ? input.options.sort((a, b) => a.priority! - b.priority!).map((option) => option.value!)
      : [];
  }
}
