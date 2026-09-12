import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigatorService, StepCoreModule } from '@exense/step-core';
import { AI_GENERATIONS_PROVIDER } from '../../injectables/ai-generations-provider';
import { AI_GENERATE_PATH, AiGenerationListStateType } from '../../shared';

@Component({
  selector: 'step-ai-generations-list',
  imports: [StepCoreModule],
  templateUrl: './ai-generations-list.component.html',
  styleUrl: './ai-generations-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiGenerationsListComponent {
  private readonly _provider = inject(AI_GENERATIONS_PROVIDER);
  private readonly _navigator = inject(NavigatorService);

  protected readonly stateType = AiGenerationListStateType;
  protected readonly state = toSignal(this._provider.state$, {
    initialValue: { type: AiGenerationListStateType.LOADING },
  });

  protected generatePlan(): void {
    this._navigator.navigate(`${AI_GENERATE_PATH}/generate`);
  }
}
