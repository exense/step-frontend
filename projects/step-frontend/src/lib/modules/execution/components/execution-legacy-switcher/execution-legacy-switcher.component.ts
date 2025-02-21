import { Component, computed, effect, inject, input, Signal, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Execution, ExecutionViewMode, ExecutionViewModeService } from '@exense/step-core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'step-execution-legacy-switcher',
  templateUrl: './execution-legacy-switcher.component.html',
  styleUrl: './execution-legacy-switcher.component.scss',
})
export class ExecutionLegacySwitcherComponent {
  /** @Input() **/
readonly execution = input<Execution | undefined>();

  protected _executionViewModeService = inject(ExecutionViewModeService);

  protected isDisabled = computed(() => {
    const exec = this.execution();
    return !exec || !this._executionViewModeService.isNewExecutionAvailable(exec);
  });

  protected toggleControl = new FormControl(false);

  protected forceLegacyReporting = toSignal(this._executionViewModeService.checkForceLegacyReporting(), {
    initialValue: false,
  });

  constructor() {
    effect(() => {
      if (this.execution()) {
        this.updateToggleState();
      }
    });

    this.toggleControl.valueChanges.subscribe((enabled) => {
      this._executionViewModeService.setForceLegacyView(!enabled);
      window.location.reload();
    });
  }

  private updateToggleState() {
    const exec = this.execution();
    if (!exec) {
      this.toggleControl.disable({ emitEvent: false });
      return;
    }

    if (this.isDisabled()) {
      this.toggleControl.disable({ emitEvent: false });
    } else {
      this.toggleControl.enable({ emitEvent: false });
    }

    this._executionViewModeService
      .getExecutionMode(exec)
      .pipe(map((mode) => mode !== ExecutionViewMode.LEGACY))
      .subscribe((isLegacyMode) => {
        this.toggleControl.setValue(isLegacyMode, { emitEvent: false });
      });
  }
}
