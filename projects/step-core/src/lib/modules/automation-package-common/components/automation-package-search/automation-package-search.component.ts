import { Component, forwardRef, inject } from '@angular/core';
import { BaseFilterComponent } from '../../../basics/step-basics.module';
import { FilterCondition, SearchValue } from '../../../table/table.module';
import { AugmentedAutomationPackagesService, Input as ColInput } from '../../../../client/step-client-module';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'step-automation-package-search',
  templateUrl: './automation-package-search.component.html',
  styleUrls: ['./automation-package-search.component.scss'],
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => AutomationPackageSearchComponent),
    },
  ],
  standalone: false,
})
export class AutomationPackageSearchComponent
  extends BaseFilterComponent<SearchValue, string>
  implements CustomComponent
{
  private static searchValueCache = new Map<string, string>();

  private _api = inject(AugmentedAutomationPackagesService);

  context?: ColInput;

  protected createControl(fb: FormBuilder): FormControl<string> {
    return fb.nonNullable.control('');
  }

  protected createControlChangeStream(control: FormControl<string>): Observable<SearchValue> {
    return control.valueChanges.pipe(
      debounceTime(200),
      switchMap((searchValue) => {
        const searchPackageName = (searchValue ?? '').trim();
        if (!searchPackageName) {
          return of({ packageIds: undefined, searchPackageName });
        }
        return this._api.searchPackageIDsByName(searchPackageName).pipe(
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
        AutomationPackageSearchComponent.searchValueCache.set(result.value, searchPackageName);
        return result;
      }),
    );
  }

  protected override transformFilterValueToControlValue(value?: SearchValue): string {
    if (!value || value instanceof FilterCondition) {
      return '';
    }
    const searchValue = typeof value === 'string' ? value : value.value;
    const cachedValue = AutomationPackageSearchComponent.searchValueCache.get(searchValue);
    return cachedValue ?? searchValue;
  }
}
