import { inject, Injectable, InjectionToken, OnInit } from '@angular/core';
import { UserService } from '@exense/step-core';
import { BehaviorSubject } from 'rxjs';

export type ExecutionTreePagingSetting = Record<string, { skip: number }>;

export const EXECUTION_TREE_PAGING_SETTINGS = new InjectionToken<ExecutionTreePagingSetting>(
  'Execution tree paging settings'
);

@Injectable()
export class ExecutionTreePagingService {
  private _userService = inject(UserService);
  readonly MAX_NODES_DEFAULT = 1000;
  private _preferencesFetched = false;
  private customPaging$ = new BehaviorSubject<number>(this.MAX_NODES_DEFAULT);

  getExecutionTreePaging(): number {
    if (!this._preferencesFetched) {
      this.initCustomPaging();
    }
    return this.customPaging$.value;
  }

  private initCustomPaging(): void {
    if (!this._preferencesFetched) {
      let _customPaging: number | undefined;
      this._userService.getPreferences().subscribe((preferences) => {
        this._preferencesFetched = true;
        _customPaging = preferences?.preferences?.['execution_tree_max_nodes'];
        if (_customPaging !== undefined) {
          this.customPaging$.next(_customPaging);
        }
      });
    }
  }
}
