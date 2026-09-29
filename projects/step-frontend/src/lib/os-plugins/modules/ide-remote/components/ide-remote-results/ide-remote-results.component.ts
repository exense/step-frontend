import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RemoteExecution, StepCoreModule } from '@exense/step-core';

@Component({
  selector: 'step-ide-remote-results',
  imports: [StepCoreModule],
  templateUrl: './ide-remote-results.component.html',
  styleUrl: './ide-remote-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdeRemoteResultsComponent {
  readonly results = input<RemoteExecution[] | undefined>();
  protected readonly rows = computed(() => {
    const results = this.results();
    return results?.map((result, index) => ({
      key: index,
      url: result.executionUrl?.trim() ? result.executionUrl : undefined,
      label: result.description?.trim() || result.executionId?.trim() || `Execution ${index + 1}`,
    }));
  });
  protected readonly missingUrls = computed(() => this.rows()?.some((row) => !row.url) ?? false);
}
