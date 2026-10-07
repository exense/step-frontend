import { AbstractControl } from '@angular/forms';
import { Signal } from '@angular/core';
import { debounceTime } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

export const signalFromFormControl = <T>(ctrl: AbstractControl<T>, debounce?: number): Signal<T> => {
  let ctrlStream$ = ctrl.valueChanges;
  if (debounce !== undefined) {
    ctrlStream$ = ctrlStream$.pipe(debounceTime(debounce));
  }
  return toSignal(ctrlStream$, { initialValue: ctrl.value });
};
