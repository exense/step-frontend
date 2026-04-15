import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CommonEntitiesUrlsService, ControllerService, Execution, PopoverMode } from '@exense/step-core';
import { catchError, filter, map, of, shareReplay, startWith, switchMap, take } from 'rxjs';

interface RepositoryLinkItem {
  label: string;
  url: string;
}

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
  private _controllerService = inject(ControllerService);

  readonly execution = input.required<Execution>();
  protected readonly PopoverMode = PopoverMode;

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

  protected readonly externalLinkRepository = computed(() => {
    const execution = this.execution();
    const repository = execution.executionParameters?.repositoryObject;
    if (
      !execution.planId ||
      !repository ||
      repository.repositoryID === 'Artifact' ||
      repository.repositoryParameters?.['wrapPlans'] === 'true' ||
      repository.repositoryID === 'local'
    ) {
      return undefined;
    }
    return repository;
  });

  private readonly repositoryLinks$ = toObservable(this.externalLinkRepository).pipe(
    filter((repository) => !!repository),
    take(1),
    switchMap((repository) => {
      return this._controllerService.getArtefactLinks(repository).pipe(
        map((artefactLinks) =>
          (artefactLinks.links ?? [])
            .filter((link) => !!link.url && `${link.url}`.trim() !== '')
            .map((link) => {
              const url = link.url!.trim();
              return {
                url,
                label: link.description || url,
              } as RepositoryLinkItem;
            }),
        ),
        catchError(() => of([])),
      );
    }),
    startWith([]),
    shareReplay(1),
  );

  protected readonly repositoryLinks = toSignal(this.repositoryLinks$, {
    initialValue: [] as RepositoryLinkItem[],
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
