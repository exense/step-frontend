import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonEntitiesUrlsService, ControllerService, Execution } from '@exense/step-core';
import { catchError, of, startWith, switchMap } from 'rxjs';
import {
  AltExecutionPlanRepositoryLinkDialogComponent,
  AltExecutionPlanRepositoryLinkDialogData,
  AltExecutionPlanRepositoryLinkDialogResult,
} from '../alt-execution-plan-repository-link-dialog/alt-execution-plan-repository-link-dialog.component';

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
  private _router = inject(Router);
  private _dialog = inject(MatDialog);
  private _window = inject(DOCUMENT).defaultView;

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

  private readonly repositoryLink$ = toObservable(this.externalLinkRepository).pipe(
    switchMap((repository) => {
      if (!repository) {
        return of(undefined);
      }

      return this._controllerService.getArtefactLinks(repository).pipe(
        map((artefactLinks) => artefactLinks.links?.[0]?.url?.trim() || undefined),
        catchError(() => of(undefined)),
        startWith(undefined),
      );
    }),
  );

  protected readonly repositoryLink = toSignal(this.repositoryLink$, {
    initialValue: undefined as string | undefined,
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

  protected openPlan(): void {
    const planLink = this.planLink();
    if (!planLink) {
      return;
    }

    const repository = this.externalLinkRepository();
    const repositoryLink = this.repositoryLink();

    if (repository?.repositoryID && repositoryLink) {
      this._dialog
        .open<
          AltExecutionPlanRepositoryLinkDialogComponent,
          AltExecutionPlanRepositoryLinkDialogData,
          AltExecutionPlanRepositoryLinkDialogResult
        >(AltExecutionPlanRepositoryLinkDialogComponent, {
          data: {
            repositoryId: repository.repositoryID,
          },
        })
        .afterClosed()
        .subscribe((result) => {
          if (result === 'repository') {
            this._window?.open(repositoryLink, '_blank');
            return;
          }
          if (result === 'step') {
            this._router.navigateByUrl(planLink);
          }
        });

      return;
    }

    this._router.navigateByUrl(planLink);
  }
}
