import { AbstractControl } from '@angular/forms';
import { computed, DestroyRef, signal } from '@angular/core';
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const warningsContainerKey = Symbol('WarningsContainerKey');

export class WarningContainer {
  private warningsInternal = signal<Record<string, string> | undefined>(undefined);

  readonly warnings = this.warningsInternal.asReadonly();
  readonly hasWarnings = computed(() => Object.keys(this.warningsInternal() ?? {}).length > 0);

  setWarnings(warnings: Record<string, string>): void {
    this.warningsInternal.set(warnings);
  }

  clearWarnings(): void {
    this.warningsInternal.set(undefined);
  }
}

export const decorateWithWarnings = (control: AbstractControl, destroyRef: DestroyRef): AbstractControl => {
  const container = new WarningContainer();
  control.valueChanges
    .pipe(debounceTime(300), takeUntilDestroyed(destroyRef))
    .subscribe(() => container.clearWarnings());
  (control as any)[warningsContainerKey] = container;
  return control;
};

export const getControlWarningsContainer = (control: AbstractControl): WarningContainer | undefined => {
  return (control as any)[warningsContainerKey] as WarningContainer | undefined;
};
