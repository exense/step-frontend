import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Resource } from '../../../../client/step-client-module';
import { TableLocalDataSource, TableModule } from '../../../../modules/table/table.module';
import { StepBasicsModule } from '../../../basics/step-basics.module';

export interface FileAlreadyExistingDialogData {
  similarResources: Resource[];
}

@Component({
  selector: 'step-file-already-existing-dialog',
  templateUrl: './file-already-existing-dialog.component.html',
  styleUrls: ['./file-already-existing-dialog.component.scss'],
  imports: [StepBasicsModule, TableModule],
  host: {
    '(keydown.enter)': 'createNewResource()',
  },
})
export class FileAlreadyExistingDialogComponent {
  protected _matDialogRef =
    inject<MatDialogRef<FileAlreadyExistingDialogComponent, Resource | undefined>>(MatDialogRef);

  private _matDialogData = inject<FileAlreadyExistingDialogData>(MAT_DIALOG_DATA);

  protected readonly similarResourceDataSource = new TableLocalDataSource(
    this._matDialogData.similarResources,
    TableLocalDataSource.configBuilder<Resource>()
      .addSearchStringPredicate('resourceName', (item) => item.resourceName)
      .addSortStringPredicate('resourceName', (item) => item.resourceName)
      .build(),
  );

  protected selectResource(resource: Resource): void {
    this._matDialogRef.close(resource);
  }

  protected createNewResource(): void {
    this._matDialogRef.close();
  }
}
