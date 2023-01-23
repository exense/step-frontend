import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { History } from '../../client/generated';
import { TableLocalDataSource } from '../../modules/table/shared/table-local-data-source';
import { AugmentedResourcesService } from '../../client/augmented/services/augmented-resources-service';
import { FilterConditionFactoryService } from '../../modules/table/services/filter-condition-factory.service';
import { SearchColDirective } from '../../modules/table/directives/search-col.directive';

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
    @Inject(MAT_DIALOG_DATA) public plan: { version: string; history: Observable<History[]> }
  ) {
    this.dataSource = new TableLocalDataSource(plan.history, {
      searchPredicates: {
        updateTime: (element, searchValue) => {
          console.log(element, searchValue);
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
    if (history.id) {
      this._matDialogRef.close(history.id);
    }
  }

  cancel(): void {
    this._matDialogRef.close(undefined);
  }
}
