import { Component, OnInit, inject, HostListener } from '@angular/core';
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
  standalone: false,
})
export class FileAlreadyExistingDialogComponent {
  protected _matDialogRef = inject<MatDialogRef<FileAlreadyExistingDialogComponent, string | undefined>>(MatDialogRef);

  private _matDialogData = inject<FileAlreadyExistingDialogData>(MAT_DIALOG_DATA);

  protected readonly similarResourceDataSource = new TableLocalDataSource(
    this._matDialogData.similarResources,
    TableLocalDataSource.configBuilder<Resource>()
      .addSearchStringPredicate('resourceName', (item) => item.resourceName)
      .addSortStringPredicate('resourceName', (item) => item.resourceName)
      .build(),
  );

  protected selectResource(resourceId: string): void {
    this._matDialogRef.close(resourceId);
  }

  @HostListener('keydown.enter')
  protected createNewResource(): void {
    this._matDialogRef.close();
  }
}
