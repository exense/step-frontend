import { Directive, inject } from '@angular/core';
import { ItemsPerPageService } from '@exense/step-core';
import { map, Observable, of } from 'rxjs';
import { VIEW_MODE, ViewMode } from '../shared/view-mode';

const VIEW_PAGE_SIZE = 100;
const PRINT_PAGE_SIZE = 50_000;

@Directive({
  selector: '[stepAltReportNodeListItemsPerPage]',
  providers: [
    {
      provide: ItemsPerPageService,
      useExisting: AltReportNodeListItemsPerPageDirective,
    },
  ],
})
export class AltReportNodeListItemsPerPageDirective implements ItemsPerPageService {
  private readonly _mode = inject(VIEW_MODE, { optional: true });

  getItemsPerPage(): Observable<number[]> {
    const allowedPageSize = this._mode === ViewMode.PRINT ? PRINT_PAGE_SIZE : VIEW_PAGE_SIZE;
    return of([allowedPageSize]);
  }

  getDefaultPageSizeItem(): Observable<number> {
    return this.getItemsPerPage().pipe(map((items) => items[0]));
  }
}
