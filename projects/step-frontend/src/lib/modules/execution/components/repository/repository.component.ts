import { ChangeDetectionStrategy, Component, forwardRef, inject, OnInit } from '@angular/core';
import { AuthService, ExecutiontTaskParameters, ScheduledTaskTemporaryStorageService } from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AltExecutionLaunchDialogData } from '../alt-execution-launch-dialog/alt-execution-launch-dialog.component';
import { SchedulerInvokerService } from '../../services/scheduler-invoker.service';

const createRepositoryExecutionData = (): AltExecutionLaunchDialogData => {
  const search = inject(ActivatedRoute).snapshot.queryParams;
  return {
    repoRef: {
      repositoryID: search['repositoryId'],
      repositoryParameters: Object.entries(search).reduce(
        (result, [key, value]) => {
          if (!['repositoryId', 'tenant'].includes(key)) {
            result[key] = value as string;
          }
          return result;
        },
        {} as Record<string, string>,
      ),
    },
    isolateExecution: !!search['isolate'],
    hideCancel: true,
    embedded: true,
  };
};

@Component({
  selector: 'step-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss'],
  providers: [
    {
      provide: SchedulerInvokerService,
      useExisting: forwardRef(() => RepositoryComponent),
    },
    {
      provide: MAT_DIALOG_DATA,
      useFactory: createRepositoryExecutionData,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class RepositoryComponent implements OnInit, SchedulerInvokerService {
  private _auth = inject(AuthService);
  private _activatedRoute = inject(ActivatedRoute);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _router = inject(Router);

  protected readonly _executionData = inject<AltExecutionLaunchDialogData>(MAT_DIALOG_DATA);

  ngOnInit(): void {
    const user = this._activatedRoute.snapshot.queryParams['user'];
    if (user) {
      this._auth.updateContext({ userID: user });
    }
  }

  // eslint-disable-next-line step-lint/component-public-fields -- The embedded launch view injects SchedulerInvokerService and calls this scheduling hook.
  openScheduler(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate(['.', 'schedule', temporaryId], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'preserve',
    });
  }
}
