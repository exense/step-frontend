import { Component, HostListener, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, map, of, tap, timer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import {
  AsyncTaskStatusResource,
  AsyncTasksService,
  AugmentedResourcesService,
  ExportsService,
  pollAsyncTask,
} from '../../../../client/step-client-module';
import { AlertType, DialogRouteResult, DialogsService, StepBasicsModule } from '../../../basics/step-basics.module';
import { ExportDialogData } from '../../types/export-dialog-data.interface';

@Component({
  selector: 'step-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
  imports: [StepBasicsModule],
})
export class ExportDialogComponent {
  private _fb = inject(FormBuilder).nonNullable;
  private _dialogs = inject(DialogsService);
  private _exportApi = inject(ExportsService);
  private _resourcesApi = inject(AugmentedResourcesService);
  private _asyncService = inject(AsyncTasksService);
  private _matDialogRef = inject<MatDialogRef<ExportDialogComponent, DialogRouteResult>>(MatDialogRef);
  private _data = inject<ExportDialogData>(MAT_DIALOG_DATA);

  protected progress = 0;
  protected showOptions = true;
  protected isExporting = false;

  readonly title = this._data.title;
  readonly exportForm = this._fb.group({
    filename: this._fb.control(this._data.filename, Validators.required),
    recursively: this._fb.control(true),
    parameters: this._fb.control(false),
  });
  readonly AlertType = AlertType;

  @HostListener('keydown.enter')
  save(): void {
    if (this.exportForm.invalid) {
      this.exportForm.markAllAsTouched();
      return;
    }
    // Retrieve the file name before exportInvocation,
    // because during the operation form will be disabled.
    // Angular doesn't include values of disabled controls in the formValue
    // The filename itself will be used below, during the download operation
    const filename = this.exportForm.value.filename!;

    this.invokeExport()
      .pipe(
        tap(() => {
          this.exportForm.disable();
          this.isExporting = true;
        }),
        pollAsyncTask(this._asyncService, (progress) => {
          this.progress = progress * 100;
        }),
        switchMap((result) => timer(500).pipe(map(() => result))),
        map((status) => {
          if (status.error) {
            throw status.error;
          }
          return status;
        }),
        switchMap((status) => {
          const attachmentID = status.result.id;
          if (!status?.warnings?.length) {
            return of({ attachmentID });
          }
          return this._dialogs
            .showListOfMsgs(status.warnings!)
            .pipe(switchMap((isConfirmed) => (isConfirmed ? of({ attachmentID }) : of(undefined))));
        }),
        catchError((error) => {
          this._dialogs.showErrorMsg(error).subscribe();
          return of(undefined);
        }),
      )
      .subscribe({
        next: (result) => {
          if (!result) {
            return;
          }
          if (!result.attachmentID) {
            this._dialogs
              .showErrorMsg('The export file could not be created, check the controller logs for more details')
              .subscribe();
            return;
          }
          this._resourcesApi.downloadResource(result.attachmentID, filename);
          queueMicrotask(() => this._matDialogRef.close({ isSuccess: true }));
        },
        complete: () => {
          this.exportForm.enable();
          this.isExporting = false;
        },
      });
  }

  private invokeExport(): Observable<AsyncTaskStatusResource> {
    const { entity, id } = this._data;
    const { filename, recursively, parameters } = this.exportForm.value;
    const additionalEntities: string[] | undefined = parameters ? ['parameters'] : undefined;
    return id
      ? this._exportApi.exportEntityById(entity, id, recursively, filename, additionalEntities)
      : this._exportApi.exportEntities(entity, recursively, filename, additionalEntities);
  }
}
