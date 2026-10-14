import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Execution, IDE_MODE, IdeStateStrategyService, StepBasicsModule } from '@exense/step-core';
import { isExecutionFromDifferentAutomationPackage } from '../../shared/execution-automation-package.utils';

@Component({
  selector: 'step-alt-execution-package-warning',
  imports: [StepBasicsModule],
  template: `
    @if (isDifferentPackage()) {
      <step-display-alert type="warning" title="Automation Package">
        This execution belongs to a different Automation Package than the one currently open.
      </step-display-alert>
    }
  `,
  host: { '[hidden]': '!isDifferentPackage()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltExecutionPackageWarningComponent {
  private readonly _isIdeMode = inject(IDE_MODE);
  private readonly _ideState = this._isIdeMode ? inject(IdeStateStrategyService) : undefined;

  readonly execution = input<Execution | null>();

  protected readonly isDifferentPackage = computed(() => {
    const execution = this.execution();
    const currentPackage = this._ideState?.currentPackage();
    return this._isIdeMode && isExecutionFromDifferentAutomationPackage(execution, currentPackage);
  });
}
