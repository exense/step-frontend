import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CustomComponent, ExecutionLaunchDashletContext, StepCoreModule, Tab } from '@exense/step-core';
import { RemoteExecutionStrategyService } from '../../services/remote-execution-strategy.service';

type ExecutionTarget = 'LOCAL' | 'REMOTE';

@Component({
  selector: 'step-ide-execution-target-toggle',
  imports: [StepCoreModule],
  providers: [RemoteExecutionStrategyService],
  templateUrl: './ide-execution-target-toggle.component.html',
  styleUrl: './ide-execution-target-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class IdeExecutionTargetToggleComponent implements CustomComponent, OnDestroy {
  protected readonly _strategy = inject(RemoteExecutionStrategyService);
  protected readonly launchContext = signal<ExecutionLaunchDashletContext | undefined>(undefined);
  protected readonly targets: Tab<ExecutionTarget>[] = [
    { id: 'LOCAL', label: 'Locally', tooltip: 'Execute locally' },
    { id: 'REMOTE', label: 'Remotely', tooltip: 'Execute on the configured remote' },
  ];
  protected readonly selectedTarget = computed(() => {
    const launchContext = this.launchContext();
    const selectedStrategy = launchContext?.commands?.selectedStrategy();
    return selectedStrategy === this._strategy ? 'REMOTE' : 'LOCAL';
  });

  context?: ExecutionLaunchDashletContext;

  contextChange(previousContext?: ExecutionLaunchDashletContext, currentContext?: ExecutionLaunchDashletContext): void {
    if (previousContext && previousContext.commands?.selectedStrategy() === this._strategy) {
      previousContext.commands.restoreLocalStrategy();
    }
    this.launchContext.set(currentContext);
    if (currentContext) {
      this._strategy.configure(currentContext);
    }
  }

  ngOnDestroy(): void {
    const commands = this.launchContext()?.commands;
    if (commands?.selectedStrategy() === this._strategy) {
      commands.restoreLocalStrategy();
    }
  }

  protected selectTarget(target: ExecutionTarget): void {
    const commands = this.launchContext()?.commands;
    if (!commands || this._strategy.busy()) {
      return;
    }
    if (target === 'REMOTE') {
      commands.selectStrategy(this._strategy);
    } else {
      commands.restoreLocalStrategy();
    }
  }
}
