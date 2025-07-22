import { Component, computed, HostBinding, inject, input, output } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Input as StInput, ScreensService } from '../../../../client/step-client-module';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { of, shareReplay } from 'rxjs';

export enum InputType {
  TEXT = 'TEXT',
  DROPDOWN = 'DROPDOWN',
  CHECKBOX = 'CHECKBOX',
}

export type OnChange = (value?: string) => void;
export type OnTouch = () => void;

@Component({
  template: '',
  standalone: false,
})
export abstract class BaseCustomFormInputComponent implements ControlValueAccessor {
  private _screensService = inject(ScreensService);

  /** @Input() **/
  readonly stScreen = input<string | undefined>(undefined);

  /** @Input() **/
  readonly stInputId = input<string | undefined>(undefined);

  /** @Input() **/
  readonly stInput = input<StInput | undefined>(undefined);

  /** @Output **/
  readonly touch = output();

  protected screenAndId = computed(() => {
    const stScreen = this.stScreen();
    const stInputId = this.stInputId();
    if (!stScreen || !stInputId) {
      return undefined;
    }
    return { stScreen, stInputId };
  });

  private remoteInput$ = toObservable(this.screenAndId).pipe(
    switchMap((screenAndId) => {
      if (!screenAndId) {
        return of(undefined);
      }
      return this._screensService.getInputForScreen(screenAndId.stScreen, screenAndId.stInputId);
    }),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  private remoteInput = toSignal(this.remoteInput$);

  protected input = computed(() => {
    const stInput = this.stInput();
    const remoteInput = this.remoteInput();
    return stInput || remoteInput;
  });

  protected dropdownItems = computed(() => {
    const input = this.input();
    if (!input?.options) {
      return [];
    }
    return input.options.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)).map((item) => item.value);
  });

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  readonly InputType = InputType;

  value?: string;
  @HostBinding('class.disabled') isDisabled?: boolean;
  checkboxItems: string[] = ['true', 'false'];

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
}
