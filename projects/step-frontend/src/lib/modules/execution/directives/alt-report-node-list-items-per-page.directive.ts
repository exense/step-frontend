import { Directive, inject } from '@angular/core';
import { ItemsPerPageService } from '@exense/step-core';
import { Observable, of } from 'rxjs';
import { VIEW_MODE, ViewMode } from '../shared/view-mode';
import { ALT_REPORT_NODE_LIST_DEFAULT_PAGE_SIZE } from '../shared/alt-report-node-keywords-list-config.tokens';

const DEFAULT_VIEW_PAGE_SIZE = 25;
const VIEW_PAGE_SIZE_OPTIONS = [DEFAULT_VIEW_PAGE_SIZE, 50, 100, 250];
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
  private readonly _defaultPageSize =
    inject(ALT_REPORT_NODE_LIST_DEFAULT_PAGE_SIZE, { optional: true }) ?? DEFAULT_VIEW_PAGE_SIZE;

  getItemsPerPage(): Observable<number[]> {
    const allowedPageSizes = this._mode === ViewMode.PRINT ? [PRINT_PAGE_SIZE] : VIEW_PAGE_SIZE_OPTIONS;
    return of(allowedPageSizes);
  }

  getDefaultPageSizeItem(): Observable<number> {
    const allowedPageSize = this._mode === ViewMode.PRINT ? PRINT_PAGE_SIZE : this._defaultPageSize;
    return of(allowedPageSize);
  }
}
