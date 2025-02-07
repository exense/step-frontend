import { Component, Input, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Execution, ExecutionViewMode, ExecutionViewModeService } from '@exense/step-core';

@Component({
  selector: 'step-execution-legacy-switcher',
  templateUrl: './execution-legacy-switcher.component.html',
  styleUrl: './execution-legacy-switcher.component.scss',
})
export class ExecutionLegacySwitcherComponent implements OnInit, OnChanges {
  @Input() execution!: Execution;
  protected _executionViewModeService = inject(ExecutionViewModeService);

  protected isDisabled = true;
  protected toggleControl = new FormControl(false);

  ngOnInit() {
    this.updateToggleState();

    // Listen for value changes and update view mode
    this.toggleControl.valueChanges.subscribe((enabled) => {
      this._executionViewModeService.setForceLegacyView(!enabled);
      window.location.reload();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['execution'] && changes['execution'].currentValue) {
      this.updateToggleState();
    }
  }

  private updateToggleState() {
    this.isDisabled = !this._executionViewModeService.isNewExecutionAvailable(this.execution);

    if (this.isDisabled) {
      this.toggleControl.disable({ emitEvent: false });
    } else {
      this.toggleControl.enable({ emitEvent: false });
    }

    const isLegacyMode = this._executionViewModeService.getExecutionMode(this.execution) !== ExecutionViewMode.LEGACY;
    this.toggleControl.setValue(isLegacyMode, { emitEvent: false });
  }
}
