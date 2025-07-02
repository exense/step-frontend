import { Component, forwardRef, inject } from '@angular/core';
import {
  CustomComponent,
  Input as ColInput,
  AugmentedKeywordPackagesService,
  BaseFilterComponent,
  SearchValue,
  FilterCondition,
  isValidRegex,
} from '@exense/step-core';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, filter, map, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'step-function-package-search',
  templateUrl: './function-package-search.component.html',
  styleUrls: ['./function-package-search.component.scss'],
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => FunctionPackageSearchComponent),
    },
  ],
  standalone: false,
})
export class FunctionPackageSearchComponent
  extends BaseFilterComponent<SearchValue, string>
  implements CustomComponent
{
  private static searchValueCache = new Map<string, string>();

  private _augKeywordPackages = inject(AugmentedKeywordPackagesService);

  context?: ColInput;

  protected createControl(fb: FormBuilder): FormControl<string> {
    return fb.nonNullable.control('');
  }

  protected createControlChangeStream(control: FormControl<string>): Observable<SearchValue> {
    return control.valueChanges.pipe(
      debounceTime(200),
      filter((searchValue) => isValidRegex(searchValue)),
      switchMap((searchValue) => {
        const searchPackageName = (searchValue || '').trim();
        if (!searchPackageName) {
          return of({ packageIds: undefined, searchPackageName });
        }

        return this._augKeywordPackages.searchPackageIDsByName(searchPackageName).pipe(
          map((packageIds) => ({
            packageIds,
            searchPackageName,
          })),
        );
      }),
      map(({ packageIds, searchPackageName }) => {
        const result: SearchValue =
          packageIds !== undefined && packageIds.length === 0
            ? {
                value: ' ',
                regex: false,
              }
            : {
                value: packageIds === undefined ? '' : `(${packageIds.join('|')})`,
                regex: true,
              };
        FunctionPackageSearchComponent.searchValueCache.set(result.value, searchPackageName);
        return result;
      }),
    );
  }

  protected override transformFilterValueToControlValue(value?: SearchValue): string {
    if (!value || value instanceof FilterCondition) {
      return '';
    }
    const searchValue = typeof value === 'string' ? value : value.value;
    const cachedValue = FunctionPackageSearchComponent.searchValueCache.get(searchValue);
    return cachedValue ?? searchValue;
  }
}
