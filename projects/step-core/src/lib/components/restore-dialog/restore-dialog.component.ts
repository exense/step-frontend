import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { History, AugmentedResourcesService } from '../../client/step-client-module';
import {
  FilterConditionFactoryService,
  SearchColDirective,
  TableLocalDataSource,
} from '../../modules/table/table.module';
import { RestoreDialogData } from '../../modules/basics/step-basics.module';

@Component({
  selector: 'step-restore-dialog',
  templateUrl: './restore-dialog.component.html',
  styleUrls: ['./restore-dialog.component.scss'],
})
export class RestoreDialogComponent {
  readonly dataSource: TableLocalDataSource<History>;

  constructor(
    private _augmentedResourceService: AugmentedResourcesService,
    private _matDialogRef: MatDialogRef<RestoreDialogComponent>,
    private _filterConditionFactory: FilterConditionFactoryService,
    @Inject(MAT_DIALOG_DATA) public dialogData: RestoreDialogData
  ) {
    this.dataSource = new TableLocalDataSource(
      dialogData.history,
      TableLocalDataSource.configBuilder<History>()
        .addSearchNumberPredicate('updateTime', (item) => item.updateTime)
        .addSortNumberPredicate('updateTime', (item) => item.updateTime)
        .build()
    );
  }

  searchByDate(col: SearchColDirective, date?: DateTime): void {
    const condition = this._filterConditionFactory.singleDateFilterCondition(date);
    col.search(condition);
  }

  restore(history: History): void {
    if (!history.id) {
      return;
    }

    this._matDialogRef.close(history.id);
  }

  cancel(): void {
    this._matDialogRef.close(undefined);
  }
}
