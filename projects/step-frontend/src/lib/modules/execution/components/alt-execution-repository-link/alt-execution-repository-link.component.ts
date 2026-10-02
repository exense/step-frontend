import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  CommonEntitiesUrlsService,
  ControllerService,
  Execution,
  PopoverMode,
  RepositoryObjectReference,
} from '@exense/step-core';
import { catchError, distinctUntilChanged, map, of, shareReplay, startWith, switchMap } from 'rxjs';

interface RepositoryLinkItem {
  label: string;
  url: string;
}

function sameRepository(
  previous: RepositoryObjectReference | undefined,
  current: RepositoryObjectReference | undefined,
): boolean {
  if (!previous || !current) {
    return previous === current;
  }
  if (previous.repositoryID !== current.repositoryID) {
    return false;
  }
  const previousParameters = previous?.repositoryParameters ?? {};
  const currentParameters = current?.repositoryParameters ?? {};
  const previousKeys = Object.keys(previousParameters);
  return (
    previousKeys.length === Object.keys(currentParameters).length &&
    previousKeys.every((key) => previousParameters[key] === currentParameters[key])
  );
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
      execution.executionParameters?.isolatedExecution ||
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
      execution.executionParameters?.isolatedExecution ||
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
    distinctUntilChanged(sameRepository),
    switchMap((repository) => {
      if (!repository) {
        return of([] as RepositoryLinkItem[]);
      }
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
        startWith([] as RepositoryLinkItem[]),
      );
    }),
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
