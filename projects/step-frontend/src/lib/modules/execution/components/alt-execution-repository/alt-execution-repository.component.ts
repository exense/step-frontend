import { Component, computed, effect, input } from '@angular/core';
import { RepositoryObjectReference } from '@exense/step-core';

@Component({
  selector: 'step-alt-execution-repository',
  templateUrl: './alt-execution-repository.component.html',
  styleUrl: './alt-execution-repository.component.scss',
})
export class AltExecutionRepositoryComponent {
  readonly repositoryParams = input.required<RepositoryObjectReference>();

  constructor() {
    effect(() => {
      console.log(this.repositoryParams());
    });
  }

  protected readonly repositoryId = computed(() => this.repositoryParams().repositoryID);

  protected readonly repositoryKey = computed(() => {
    const id = this.repositoryId() ?? '';
    return id.slice(0, 2).toUpperCase();
  });

  protected readonly repositoryItems = computed(() => {
    const params = this.repositoryParams();
    return params.repositoryParameters ?? {};
  });
}
