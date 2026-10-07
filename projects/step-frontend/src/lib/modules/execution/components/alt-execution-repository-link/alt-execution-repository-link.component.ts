import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  AugmentedPlansService,
  CommonEntitiesUrlsService,
  ControllerService,
  Execution,
  IDE_MODE,
  IdeStateStrategyService,
  PopoverMode,
  RepositoryObjectReference,
} from '@exense/step-core';
import { catchError, distinctUntilChanged, map, Observable, of, shareReplay, startWith, switchMap } from 'rxjs';
import { isExecutionFromDifferentAutomationPackage } from '../../shared/execution-automation-package.utils';

const ISOLATED_AUTOMATION_PACKAGE_REPOSITORY = 'isolatedAutomationPackage';
const LOAD_AUTOMATION_PACKAGE_REASON = 'Load the Automation Package containing this plan in order to open it';

interface IsolatedPlanLookup {
  name?: string;
  packageDirectory?: string;
  differentPackage: boolean;
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
  private _isIdeMode = inject(IDE_MODE);
  private _plansService = this._isIdeMode ? inject(AugmentedPlansService) : undefined;
  private readonly _ideState = this._isIdeMode ? inject(IdeStateStrategyService) : undefined;

  readonly execution = input.required<Execution>();
  protected readonly PopoverMode = PopoverMode;

  private readonly isDifferentPackage = computed(() => {
    const execution = this.execution();
    const currentPackage = this._ideState?.currentPackage();
    return this._isIdeMode && isExecutionFromDifferentAutomationPackage(execution, currentPackage);
  });

  private readonly isIsolatedExecution = computed(() => {
    const execution = this.execution();
    const parameters = execution.executionParameters;
    return (
      !!parameters?.isolatedExecution ||
      parameters?.repositoryObject?.repositoryID === ISOLATED_AUTOMATION_PACKAGE_REPOSITORY
    );
  });

  private readonly persistedPlanLink = computed(() => {
    const execution = this.execution();
    const isIsolatedExecution = this.isIsolatedExecution();

    const repository = execution.executionParameters?.repositoryObject;

    if (
      isIsolatedExecution ||
      repository?.repositoryID === 'Artifact' ||
      repository?.repositoryParameters?.['wrapPlans'] === 'true' ||
      !execution?.planId
    ) {
      return undefined;
    }

    return this._commonEntitiesUrl.planEditorUrl(execution.planId);
  });

  private readonly isolatedPlanLookup = computed<IsolatedPlanLookup | undefined>(() => {
    const execution = this.execution();
    const isIsolatedExecution = this.isIsolatedExecution();
    const differentPackage = this.isDifferentPackage();
    const currentPackage = this._ideState?.currentPackage();
    const repository = execution.executionParameters?.repositoryObject;
    if (
      !this._isIdeMode ||
      !isIsolatedExecution ||
      repository?.repositoryID !== ISOLATED_AUTOMATION_PACKAGE_REPOSITORY ||
      repository.repositoryParameters?.['wrapPlans'] === 'true'
    ) {
      return undefined;
    }
    const name = repository.repositoryParameters?.['includePlans'];
    return { name: name || undefined, differentPackage, packageDirectory: currentPackage?.directory };
  });

  private readonly isolatedPlanLinkState = toSignal(
    toObservable(this.isolatedPlanLookup).pipe(
      distinctUntilChanged(
        (previous, current) =>
          previous?.name === current?.name &&
          previous?.differentPackage === current?.differentPackage &&
          previous?.packageDirectory === current?.packageDirectory &&
          !!previous === !!current,
      ),
      switchMap((lookup): Observable<PlanLinkState> => {
        if (!lookup || !this._plansService) {
          return of({});
        }
        if (lookup.differentPackage || !lookup.packageDirectory) {
          return of({ disabledReason: LOAD_AUTOMATION_PACKAGE_REASON });
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
          startWith({ disabledReason: 'Looking up the executed plan in the Automation Package opened in the Studio' }),
        );
      }),
    ),
    { initialValue: {} as PlanLinkState },
  );

  protected readonly planLink = computed(() => {
    const persistedPlanLink = this.persistedPlanLink();
    const isolatedPlanLinkState = this.isolatedPlanLinkState();
    const differentPackage = this.isDifferentPackage();
    if (differentPackage) {
      return undefined;
    }
    return persistedPlanLink ?? isolatedPlanLinkState.link;
  });

  protected readonly planLinkDisabledReason = computed(() => {
    const execution = this.execution();
    const isIsolatedExecution = this.isIsolatedExecution();
    const planLink = this.planLink();
    const lookup = this.isolatedPlanLookup();
    const lookupState = this.isolatedPlanLinkState();
    const differentPackage = this.isDifferentPackage();
    const repository = execution.executionParameters?.repositoryObject;
    if (differentPackage) {
      return LOAD_AUTOMATION_PACKAGE_REASON;
    }
    if (
      planLink ||
      !isIsolatedExecution ||
      repository?.repositoryID === 'Artifact' ||
      repository?.repositoryParameters?.['wrapPlans'] === 'true'
    ) {
      return undefined;
    }
    if (lookup) {
      return lookupState.disabledReason;
    }
    if (!execution.planId) {
      return undefined;
    }
    return 'Viewing the plan of an isolated execution is not yet supported';
  });

  protected readonly externalLinkRepository = computed(() => {
    const execution = this.execution();
    const isIsolatedExecution = this.isIsolatedExecution();
    const repository = execution.executionParameters?.repositoryObject;
    if (
      isIsolatedExecution ||
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
