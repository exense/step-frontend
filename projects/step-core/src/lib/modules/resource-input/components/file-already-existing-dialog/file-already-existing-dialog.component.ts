import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Resource } from '../../../../client/step-client-module';
import { TableLocalDataSource } from '../../../../modules/table/table.module';

export interface FileAlreadyExistingDialogData {
  similarResources: Resource[];
}

@Component({
  selector: 'step-file-already-existing-dialog',
  templateUrl: './file-already-existing-dialog.component.html',
  styleUrls: ['./file-already-existing-dialog.component.scss'],
})
export class FileAlreadyExistingDialogComponent implements OnInit {
  protected _matDialogRef = inject<MatDialogRef<FileAlreadyExistingDialogComponent, string | undefined>>(MatDialogRef);

  private _matDialogData = inject<FileAlreadyExistingDialogData>(MAT_DIALOG_DATA);

  protected readonly similarResourceDataSource = new TableLocalDataSource(
    this._matDialogData.similarResources,
    TableLocalDataSource.configBuilder<Resource>()
      .addSearchStringPredicate('resourceName', (item) => item.resourceName)
      .addSortStringPredicate('resourceName', (item) => item.resourceName)
      .build()
  );

  ngOnInit(): void {
    // Disable automatic closing, switch to manual
    this._matDialogRef.disableClose = true;
  }

  protected selectResource(resourceId: string): void {
    this._matDialogRef.close(resourceId);
  }

  protected createNewResource(): void {
    this._matDialogRef.close();
  }
}
