import { Component, forwardRef, HostBinding, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { Input as StInput, ScreensService } from '../../client/generated';
import { AJS_MODULE } from '../../shared';

enum InputType {
  TEXT = 'TEXT',
  DROPDOWN = 'DROPDOWN',
  CHECKBOX = 'CHECKBOX',
}

type OnChange = (value?: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-custom-form-inputs',
  templateUrl: './custom-form-input.component.html',
  styleUrls: ['./custom-form-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomFormInputComponent),
      multi: true,
    },
  ],
})
export class CustomFormInputComponent implements ControlValueAccessor, OnInit {
  @Input() stScreen?: string;
  @Input() stInput?: StInput;
  @Input() stInputId?: string;

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  readonly InputType = InputType;

  value?: string;
  @HostBinding('class.disabled') isDisabled?: boolean;
  input?: StInput;
  dropdownItems: string[] = [];
  checkboxItems: string[] = ['true', 'false'];

  constructor(private _screensService: ScreensService) {}

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

  onStateChange(): void {
    this.onTouch?.();
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

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepCustomFormInputs', downgradeComponent({ component: CustomFormInputComponent }));
