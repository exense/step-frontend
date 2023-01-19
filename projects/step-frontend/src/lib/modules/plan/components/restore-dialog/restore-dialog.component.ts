import { Component, Inject } from '@angular/core';
import {
  AugmentedResourcesService,
  PlansService,
  TableLocalDataSource,
  History,
  SearchColDirective,
  FilterConditionFactoryService,
} from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateTime } from 'luxon';

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
    private _plansService: PlansService,
    private _filterConditionFactory: FilterConditionFactoryService,
    @Inject(MAT_DIALOG_DATA) public plan: { id: string; version: string }
  ) {
    this.dataSource = new TableLocalDataSource(this._plansService.getPlanHistory(plan.id), {
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

  // FIXME: Add some throbber when loading
  restore(history: History): void {
    if (history.id) {
      this._plansService.restorePlanVersion(this.plan.id, history.id).subscribe(() => this._matDialogRef.close(true));
    }
  }

  cancel(): void {
    this._matDialogRef.close(false);
  }
}
