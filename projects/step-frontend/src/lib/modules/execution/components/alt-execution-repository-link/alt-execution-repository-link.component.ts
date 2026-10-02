import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  AugmentedPlansService,
  CommonEntitiesUrlsService,
  ControllerService,
  Execution,
  IDE_MODE,
  PopoverMode,
  RepositoryObjectReference,
} from '@exense/step-core';
import { catchError, distinctUntilChanged, map, Observable, of, shareReplay, startWith, switchMap } from 'rxjs';

const ISOLATED_AUTOMATION_PACKAGE_REPOSITORY = 'isolatedAutomationPackage';

interface IsolatedPlanLookup {
  name?: string;
}

interface PlanLinkState {
  link?: string;
  disabledReason?: string;
}

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
  private _plansService = inject(AugmentedPlansService);
  private _isIdeMode = inject(IDE_MODE);

  readonly execution = input.required<Execution>();
  protected readonly PopoverMode = PopoverMode;

  private readonly persistedPlanLink = computed(() => {
    const execution = this.execution();

    const repository = execution.executionParameters?.repositoryObject;

    if (
      repository?.repositoryID === 'Artifact' ||
      // The plan of an isolated execution only exists for the time of the execution
      repository?.repositoryID === ISOLATED_AUTOMATION_PACKAGE_REPOSITORY ||
      repository?.repositoryParameters?.['wrapPlans'] === 'true' ||
      !execution?.planId
    ) {
      return undefined;
    }

    return this._commonEntitiesUrl.planEditorUrl(execution.planId);
  });

  private readonly isIsolatedPlanExecution = computed(() => {
    const repository = this.execution().executionParameters?.repositoryObject;
    return (
      repository?.repositoryID === ISOLATED_AUTOMATION_PACKAGE_REPOSITORY &&
      repository.repositoryParameters?.['wrapPlans'] !== 'true'
    );
  });

  /**
   * In IDE mode, an isolated execution runs a plan of the opened automation package, selected by its name
   */
  private readonly isolatedPlanLookup = computed<IsolatedPlanLookup | undefined>(() => {
    if (!this._isIdeMode || !this.isIsolatedPlanExecution()) {
      return undefined;
    }
    const name = this.execution().executionParameters?.repositoryObject?.repositoryParameters?.['includePlans'];
    return { name: name || undefined };
  });

  private readonly isolatedPlanLinkState = toSignal(
    toObservable(this.isolatedPlanLookup).pipe(
      distinctUntilChanged((previous, current) => previous?.name === current?.name && !previous === !current),
      switchMap((lookup): Observable<PlanLinkState> => {
        if (!lookup) {
          return of({});
        }
        const name = lookup.name;
        if (!name) {
          return of({ disabledReason: 'The executed plan cannot be determined from this execution' });
        }
        return this._plansService.findPlansByAttributes({ name }).pipe(
          map((plans): PlanLinkState => {
            if (plans.length === 1) {
              return { link: this._commonEntitiesUrl.planEditorUrl(plans[0]) };
            }
            return {
              disabledReason:
                plans.length === 0
                  ? `The plan "${name}" was not found in the Automation Package opened in the Studio`
                  : `Several plans are named "${name}" in the Automation Package opened in the Studio`,
            };
          }),
          catchError(() => of({ disabledReason: `The plan "${name}" could not be looked up` })),
          startWith({}),
        );
      }),
    ),
    { initialValue: {} as PlanLinkState },
  );

  protected readonly planLink = computed(() => this.persistedPlanLink() ?? this.isolatedPlanLinkState().link);

  /**
   * The reason why the plan of the execution cannot be opened, when a link to it would be expected
   */
  protected readonly planLinkDisabledReason = computed(() => {
    if (this.planLink() || !this.isIsolatedPlanExecution()) {
      return undefined;
    }
    return this._isIdeMode
      ? this.isolatedPlanLinkState().disabledReason
      : 'Viewing the plan of an isolated execution is not yet supported';
  });

  protected readonly externalLinkRepository = computed(() => {
    const execution = this.execution();
    const repository = execution.executionParameters?.repositoryObject;
    if (
      !execution.planId ||
      !repository ||
      repository.repositoryID === 'Artifact' ||
      repository.repositoryID === ISOLATED_AUTOMATION_PACKAGE_REPOSITORY ||
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
