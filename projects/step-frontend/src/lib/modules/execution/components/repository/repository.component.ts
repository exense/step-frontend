import { Component, forwardRef, inject, OnInit, ViewContainerRef } from '@angular/core';
import {
  AuthService,
  ExecutiontTaskParameters,
  RepositoryObjectReference,
  ScheduledTaskTemporaryStorageService,
} from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  AltExecutionLaunchDialogComponent,
  AltExecutionLaunchDialogData,
} from '../alt-execution-launch-dialog/alt-execution-launch-dialog.component';
import { SchedulerInvokerService } from '../../services/scheduler-invoker.service';

@Component({
  selector: 'step-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss'],
  providers: [
    {
      provide: SchedulerInvokerService,
      useExisting: forwardRef(() => RepositoryComponent),
    },
  ],
  standalone: false,
})
export class RepositoryComponent implements OnInit, SchedulerInvokerService {
  private _dialog = inject(MatDialog);
  private _viewContainerRef = inject(ViewContainerRef);
  private _auth = inject(AuthService);
  private _activatedRoute = inject(ActivatedRoute);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _router = inject(Router);

  ngOnInit(): void {
    this.showDialog();
  }

  openScheduler(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate(['.', 'schedule', temporaryId], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'preserve',
    });
  }

  private showDialog(): void {
    const search = this._activatedRoute.snapshot.queryParams;
    const isolateExecution = !!search['isolate'];

    if (search['user']) {
      this._auth.updateContext({ userID: search['user'] });
    }

    const repositoryID = search['repositoryId'];
    if (!repositoryID) {
      return;
    }

    const repoRef: RepositoryObjectReference = {
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
    };

    this._dialog.open(AltExecutionLaunchDialogComponent, {
      data: {
        repoRef,
        isolateExecution,
        hideCancel: true,
      } as AltExecutionLaunchDialogData,
      viewContainerRef: this._viewContainerRef,
      hasBackdrop: false,
    });
  }
}
