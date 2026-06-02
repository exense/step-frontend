import { Directive, inject } from '@angular/core';
import { ItemsPerPageService } from '@exense/step-core';
import { Observable, of } from 'rxjs';
import { VIEW_MODE, ViewMode } from '../shared/view-mode';

const VIEW_PAGE_SIZE = 100;
const VIEW_PAGE_SIZE_OPTIONS = [25, 50, VIEW_PAGE_SIZE, 250];
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
    const allowedPageSizes = this._mode === ViewMode.PRINT ? [PRINT_PAGE_SIZE] : VIEW_PAGE_SIZE_OPTIONS;
    return of(allowedPageSizes);
  }

  getDefaultPageSizeItem(): Observable<number> {
    const allowedPageSize = this._mode === ViewMode.PRINT ? PRINT_PAGE_SIZE : VIEW_PAGE_SIZE;
    return of(allowedPageSize);
  }
}
