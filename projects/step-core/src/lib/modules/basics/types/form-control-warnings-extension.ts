import { AbstractControl } from '@angular/forms';
import { computed, DestroyRef, signal, WritableSignal } from '@angular/core';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const warningsContainerKey = Symbol('WarningsContainerKey');

export type WarningsDictionary = Record<string, string>;

export class WarningContainer {
  private ordinaryWarnings = signal<WarningsDictionary | undefined>(undefined);
  private persistentWarnings = signal<WarningsDictionary | undefined>(undefined);

  readonly warnings = computed(() => {
    const ordinary = this.ordinaryWarnings() ?? {};
    const persistent = this.persistentWarnings() ?? {};
    return { ...ordinary, ...persistent };
  });

  readonly hasWarnings = computed(() => Object.keys(this.warnings()).length > 0);

  setWarning(key: string, message: string | undefined, isPersistent?: boolean): this {
    const isAdd = !!message;
    const destination = !isPersistent ? this.ordinaryWarnings : this.persistentWarnings;
    const opposite = !isPersistent ? this.persistentWarnings : this.ordinaryWarnings;

    if (isAdd) {
      this.removeWarningInternal(key, opposite);
      destination.update((value) => {
        const result = { ...(value ?? {}) };
        result[key] = message;
        return result;
      });
    } else {
      this.removeWarningInternal(key, opposite);
      this.removeWarningInternal(key, destination);
    }
    return this;
  }

  clearNonPersistentWarnings(): this {
    this.ordinaryWarnings.set(undefined);
    return this;
  }

  clearAll(): this {
    this.ordinaryWarnings.set(undefined);
    this.persistentWarnings.set(undefined);
    return this;
  }

  private removeWarningInternal(key: string, dictionary: WritableSignal<WarningsDictionary | undefined>): void {
    dictionary.update((value) => {
      if (!value?.[key]) {
        return value;
      }
      const result = { ...value };
      delete result[key];
      return result;
    });
  }
}

export const decorateWithWarnings = <T extends AbstractControl>(
  control: T,
  destroyRefOrTerminator: DestroyRef | Subject<unknown> | Subject<void>,
): T => {
  const container = new WarningContainer();

  const destroy =
    destroyRefOrTerminator instanceof DestroyRef
      ? takeUntilDestroyed(destroyRefOrTerminator)
      : takeUntil(destroyRefOrTerminator);

  control.valueChanges.pipe(debounceTime(300), destroy).subscribe(() => container.clearNonPersistentWarnings());
  (control as any)[warningsContainerKey] = container;
  return control;
};

export const getControlWarningsContainer = (control: AbstractControl): WarningContainer | undefined => {
  return (control as any)[warningsContainerKey] as WarningContainer | undefined;
};
