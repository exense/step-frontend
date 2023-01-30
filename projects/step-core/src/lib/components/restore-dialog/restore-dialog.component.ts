import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { History } from '../../client/generated';
import { TableLocalDataSource } from '../../modules/table/shared/table-local-data-source';
import { AugmentedResourcesService } from '../../client/augmented/services/augmented-resources-service';
import { FilterConditionFactoryService } from '../../modules/table/services/filter-condition-factory.service';
import { SearchColDirective } from '../../modules/table/directives/search-col.directive';
import { RestoreDialogData } from '../../modules/basics/shared/restore-dialog-data';

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
    this.dataSource = new TableLocalDataSource(dialogData.history, {
      searchPredicates: {
        updateTime: (element, searchValue) => {
          return element.updateTime === Number(searchValue);
        },
      },
      sortPredicates: {
        updateTime: (a, b) => {
          const valueA = a.updateTime || 0;
          const valueB = b.updateTime || 0;
          return valueA - valueB;
        },
      },
    });
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
