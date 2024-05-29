import { AfterViewInit, ChangeDetectorRef, Component, computed, inject, input, Signal } from '@angular/core';
import { ItemsPerPageService, ReportNode, TableLocalDataSource } from '@exense/step-core';
import { ViewMode } from '../../shared/view-mode';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { toSignal } from '@angular/core/rxjs-interop';

const DEFAULT_PAGE_SIZE = 7;

@Component({
  template: '',
})
export abstract class BaseAltReportNodeTableContentComponent implements ItemsPerPageService, AfterViewInit {
  private _cd = inject(ChangeDetectorRef);

  abstract mode: Signal<ViewMode>;

  private _state = inject(AltReportNodesStateService);
  protected dataSource?: TableLocalDataSource<ReportNode>;

  private total = toSignal(this._state.total$);

  ngAfterViewInit(): void {
    this.dataSource = new TableLocalDataSource(this._state.nodesToDisplay$);
    this._cd.detectChanges();
  }

  getItemsPerPage(loadedUserPreferences: (itemsPerPage: number) => void): number[] {
    const mode = this.mode();
    const total = this.total()!;
    const allowedPageSize = mode === ViewMode.PRINT ? total : DEFAULT_PAGE_SIZE;
    return [allowedPageSize];
  }
}
