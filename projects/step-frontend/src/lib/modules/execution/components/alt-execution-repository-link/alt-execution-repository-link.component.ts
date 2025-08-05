import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { CommonEntitiesUrlsService, Execution } from '@exense/step-core';

@Component({
  selector: 'step-alt-execution-repository-link',
  templateUrl: './alt-execution-repository-link.component.html',
  styleUrl: './alt-execution-repository-link.component.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AltExecutionRepositoryLinkComponent {
  private _commonEntitiesUrl = inject(CommonEntitiesUrlsService);

  readonly execution = input.required<Execution>();

  protected readonly planLink = computed(() => {
    const execution = this.execution();

    const repository = execution.executionParameters?.repositoryObject;

    if (
      repository?.repositoryID === 'Artifact' ||
      repository?.repositoryParameters?.['wrapPlans'] === 'true' ||
      !execution?.planId
    ) {
      return undefined;
    }

    return this._commonEntitiesUrl.planEditorUrl(execution.planId);
  });

  protected readonly automationPackageLinkParams = computed(() => {
    const execution = this.execution();

    const repository = execution.executionParameters?.repositoryObject;

    if (
      repository?.repositoryID === 'localAutomationPackage' &&
      repository?.repositoryParameters?.['wrapPlans'] === 'true'
    ) {
      const packageName = repository!.repositoryParameters!['apName'];
      return { tq_name: packageName };
    }

    return undefined;
  });
}
