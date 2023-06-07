import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Resource } from '../../client/step-client-module';
import { TableLocalDataSource } from '../../modules/table/table.module';

@Component({
  selector: 'step-file-already-existing-dialog',
  templateUrl: './file-already-existing-dialog.component.html',
  styleUrls: ['./file-already-existing-dialog.component.scss'],
})
export class FileAlreadyExistingDialogComponent {
  private _matDialogRef = inject<MatDialogRef<FileAlreadyExistingDialogComponent, { id?: string }>>(MatDialogRef);

  private _similarResources = inject<Resource[]>(MAT_DIALOG_DATA);

  readonly similarResourceDataSource = new TableLocalDataSource(
    this._similarResources,
    TableLocalDataSource.configBuilder<Resource>()
      .addSearchStringPredicate('resourceName', (item) => item.resourceName)
      .addSortStringPredicate('resourceName', (item) => item.resourceName)
      .build()
  );

  selectResource({ id }: Resource): void {
    this._matDialogRef.close({ id });
  }

  createNewResource(): void {
    this._matDialogRef.close({});
  }
}
