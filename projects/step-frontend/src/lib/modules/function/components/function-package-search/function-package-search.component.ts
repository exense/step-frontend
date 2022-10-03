import { AfterViewInit, Component, OnDestroy, Optional } from '@angular/core';
import { CustomComponent, TableSearch, Input as ColInput, AugmentedKeywordPackagesService } from '@exense/step-core';
import { FormBuilder } from '@angular/forms';
import { debounceTime, of, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'step-function-package-search',
  templateUrl: './function-package-search.component.html',
  styleUrls: ['./function-package-search.component.scss'],
})
export class FunctionPackageSearchComponent implements CustomComponent, AfterViewInit, OnDestroy {
  private terminator$ = new Subject<unknown>();

  context?: ColInput;

  readonly searchControl = this._formBuilder.control('');

  constructor(
    private _formBuilder: FormBuilder,
    private _augKeywordPackages: AugmentedKeywordPackagesService,
    @Optional() private _tableSearch?: TableSearch
  ) {}

  ngAfterViewInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(200),
        switchMap((searchValue) => {
          const searchPackageName = (searchValue || '').trim();
          if (!searchPackageName) {
            return of(undefined);
          }

          return this._augKeywordPackages.searchPackageIDsByName(searchPackageName);
        }),
        takeUntil(this.terminator$)
      )
      .subscribe((packageIds) => {
        if (!this.context?.id || !this._tableSearch) {
          return;
        }
        if (packageIds !== undefined && packageIds.length === 0) {
          // Current case means, that no suitable package was found that satisfied the query.
          // It means that final request should return result
          this._tableSearch.onSearch(this.context.id, ' ', false);
        } else {
          const searchValue = packageIds === undefined ? '' : `(${packageIds.join('|')})`;
          this._tableSearch.onSearch(this.context.id, searchValue);
        }
      });
  }

  ngOnDestroy() {
    this.terminator$.next(undefined);
    this.terminator$.complete();
  }
}
