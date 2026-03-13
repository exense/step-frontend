import { Directive, input } from '@angular/core';
import { SearchValue, TableParameters } from '@exense/step-core';
import { toObservable } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[stepTablePartParamsAndFilters]',
})
export class TablePartParamsAndFiltersDirective {
  readonly staticFilters = input<Record<string, SearchValue> | undefined>();
  readonly filter = input<string | undefined>(undefined);
  readonly tableParams = input<TableParameters | undefined>(undefined);

  readonly staticFilters$ = toObservable(this.staticFilters);
  readonly filter$ = toObservable(this.filter);
  readonly tableParams$ = toObservable(this.tableParams);
}
