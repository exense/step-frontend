import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CustomComponent, ExecutionLaunchDashletContext, StepCoreModule } from '@exense/step-core';
import { IdeRemoteDefaultsService } from '../../services/ide-remote-defaults.service';
import { RemoteExecutionStrategyService } from '../../services/remote-execution-strategy.service';
import { IdeRemoteResultsComponent } from '../ide-remote-results/ide-remote-results.component';
import { IdeRemoteTargetComponent } from '../ide-remote-target/ide-remote-target.component';
import { IdeRemoteExecutionOptionsComponent } from '../ide-remote-execution-options/ide-remote-execution-options.component';

@Component({
  selector: 'step-ide-remote-execution-panel',
  imports: [StepCoreModule, IdeRemoteTargetComponent, IdeRemoteResultsComponent, IdeRemoteExecutionOptionsComponent],
  templateUrl: './ide-remote-execution-panel.component.html',
  styleUrl: './ide-remote-execution-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdeRemoteExecutionPanelComponent implements CustomComponent {
  protected readonly _defaults = inject(IdeRemoteDefaultsService);
  protected readonly executionRequest = computed(() => this._defaults.getExecutionRequest());
  private readonly launchContext = signal<ExecutionLaunchDashletContext | undefined>(undefined);
  protected readonly strategy = computed(() => {
    const context = this.launchContext();
    const selectedStrategy = context?.commands?.selectedStrategy();
    return selectedStrategy instanceof RemoteExecutionStrategyService ? selectedStrategy : undefined;
  });

  context?: ExecutionLaunchDashletContext;

  contextChange(
    _previousContext?: ExecutionLaunchDashletContext,
    currentContext?: ExecutionLaunchDashletContext,
  ): void {
    this.launchContext.set(currentContext);
  }
}
