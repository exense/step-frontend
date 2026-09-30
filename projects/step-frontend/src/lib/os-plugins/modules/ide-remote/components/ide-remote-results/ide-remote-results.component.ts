import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RemoteExecution, StepCoreModule } from '@exense/step-core';

interface RemoteResultRow {
  key: number;
  label: string;
  url?: string;
  status: string;
}

@Component({
  selector: 'step-ide-remote-results',
  imports: [StepCoreModule],
  templateUrl: './ide-remote-results.component.html',
  styleUrl: './ide-remote-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdeRemoteResultsComponent {
  readonly results = input<RemoteExecution[] | undefined>();
  readonly planNames = input<string[] | undefined>();
  readonly wrapIntoTestSet = input(false);
  protected readonly rows = computed(() => {
    const results = this.results();
    const planNames = this.planNames();
    const wrapIntoTestSet = this.wrapIntoTestSet();
    const resultRow = (result: RemoteExecution, index: number): RemoteResultRow => ({
      key: index,
      url: result.executionUrl?.trim() || undefined,
      label: result.description?.trim() || result.executionId?.trim() || `Execution ${index + 1}`,
      status: 'Result URL unavailable',
    });
    if (!planNames) {
      return results?.map(resultRow);
    }

    const sharedResult = wrapIntoTestSet && results?.length === 1 ? results[0] : undefined;
    const unmatchedResults = sharedResult ? [] : [...(results ?? [])];
    const assignments = planNames.map((name) => {
      const match = unmatchedResults.findIndex((result) => result.description?.trim() === name);
      return match < 0 ? undefined : unmatchedResults.splice(match, 1)[0];
    });
    if (results?.length === planNames.length) {
      assignments.forEach((result, index) => {
        if (!result) {
          assignments[index] = unmatchedResults.shift();
        }
      });
    }

    return [
      ...planNames.map((name, index) => {
        const result = sharedResult ?? assignments[index];
        return {
          key: index,
          label: name,
          url: result?.executionUrl?.trim() || undefined,
          status:
            results === undefined
              ? 'Will execute remotely'
              : result
                ? 'Result URL unavailable'
                : 'No execution returned',
        };
      }),
      ...unmatchedResults.map((result, index) => resultRow(result, planNames.length + index)),
    ];
  });
  protected readonly missingUrls = computed(
    () => this.results()?.some((result) => !result.executionUrl?.trim()) ?? false,
  );
}
