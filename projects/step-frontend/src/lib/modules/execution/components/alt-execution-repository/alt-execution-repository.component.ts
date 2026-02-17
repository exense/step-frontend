import { Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { RepositoryObjectReference } from '@exense/step-core';

@Component({
  selector: 'step-alt-execution-repository',
  templateUrl: './alt-execution-repository.component.html',
  styleUrl: './alt-execution-repository.component.scss',
  standalone: false,
})
export class AltExecutionRepositoryComponent {
  private _route = inject(ActivatedRoute);

  readonly repositoryParams = input.required<RepositoryObjectReference>();

  protected readonly repositoryId = computed(() => this.repositoryParams().repositoryID);

  protected readonly repositoryKey = computed(() => {
    const id = this.repositoryId() ?? '';
    return id.slice(0, 2).toUpperCase();
  });

  protected readonly repositoryItems = computed(() => {
    const params = this.repositoryParams();
    return params.repositoryParameters ?? {};
  });

  protected readonly azureDevopsQueryParams = computed(() => {
    if (this.repositoryId() !== 'azure-devops') {
      return undefined;
    }

    const source = this.repositoryItems();
    const queryParams: Params = {};
    const keys: Array<keyof Params> = ['organization', 'project', 'planId', 'suiteId', 'caseId'];
    keys.forEach((key) => {
      const value = source[key as string];
      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        queryParams[key] = value;
      }
    });

    const tenant = this._route.snapshot.queryParamMap.get('tenant');
    if (tenant) {
      queryParams['tenant'] = tenant;
    }

    return Object.keys(queryParams).length > 0 ? queryParams : undefined;
  });
}
