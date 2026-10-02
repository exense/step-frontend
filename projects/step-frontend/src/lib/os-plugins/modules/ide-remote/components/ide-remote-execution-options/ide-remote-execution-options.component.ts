import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RemoteExecutionRequest, StepIconsModule } from '@exense/step-core';

@Component({
  selector: 'step-ide-remote-execution-options',
  templateUrl: './ide-remote-execution-options.component.html',
  styleUrl: './ide-remote-execution-options.component.scss',
  imports: [StepIconsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdeRemoteExecutionOptionsComponent {
  readonly request = input<RemoteExecutionRequest>();
  readonly planExecution = input(false);

  protected readonly parameters = computed(() => Object.entries(this.request()?.executionParameters ?? {}));
  protected readonly options = computed(() => {
    const request = this.request();
    if (!request) {
      return [];
    }
    const options: { label: string; value: string }[] = [];
    const add = (label: string, value: string | number | string[] | null | undefined): void => {
      if (value !== undefined && value !== null && (!Array.isArray(value) || value.length)) {
        options.push({ label, value: Array.isArray(value) ? value.join(', ') : String(value) });
      }
    };
    add('Step user', request.connection?.stepUser);
    add('Library', request.library);
    if (!this.planExecution()) {
      add('Included plans', request.includePlans);
    }
    add('Excluded plans', request.excludePlans);
    add('Included categories', request.includeCategories);
    add('Excluded categories', request.excludeCategories);
    add(
      'Wrap into test set',
      request.wrapIntoTestSet === undefined ? undefined : request.wrapIntoTestSet ? 'Yes' : 'No',
    );
    add('Threads', request.numberOfThreads);
    return options;
  });
}
