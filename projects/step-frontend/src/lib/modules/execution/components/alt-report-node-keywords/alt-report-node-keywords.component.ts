import { Component, inject, output, viewChild } from '@angular/core';
import {
  AugmentedScreenService,
  ItemsPerPageService,
  ReportNode,
  STORE_ALL,
  tablePersistenceConfigProvider,
  TablePersistenceStateService,
  TableSearch,
  TableStorageService,
} from '@exense/step-core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { BaseAltReportNodeTableContentComponent } from '../alt-report-node-table-content/base-alt-report-node-table-content.component';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { map, Observable, of } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { TableMemoryStorageService } from '../../services/table-memory-storage.service';

@Component({
  selector: 'step-alt-report-node-keywords',
  templateUrl: './alt-report-node-keywords.component.html',
  styleUrl: './alt-report-node-keywords.component.scss',
  providers: [
    {
      provide: AltReportNodesStateService,
      useExisting: AltKeywordNodesStateService,
    },
    {
      provide: ItemsPerPageService,
      useExisting: AltReportNodeKeywordsComponent,
    },
    {
      provide: TableStorageService,
      useClass: TableMemoryStorageService,
    },
    TablePersistenceStateService,
    tablePersistenceConfigProvider('keywords', STORE_ALL),
  ],
})
export class AltReportNodeKeywordsComponent extends BaseAltReportNodeTableContentComponent {
  private _screenApiService = inject(AugmentedScreenService);

  private _executionState = inject(AltExecutionStateService);
  private _dialogs = inject(AltExecutionDialogsService);

  protected tableSearch = viewChild('table', { read: TableSearch });

  protected readonly keywordsParameters$ = this._executionState.keywordParameters$;

  private keywordColumnIds = toSignal(this.getKeywordColumnIds(), { initialValue: [] });

  /** @Output() **/
  openKeywordInTreeView = output<ReportNode>();

  protected openDetails(node: ReportNode): void {
    this._dialogs.openIterationDetails(node);
  }

  override setupSearchFilter(): void {
    this._state.search$
      .pipe(
        map((value) => this._filterConditionFactory.reportNodeFilterCondition(value, this.keywordColumnIds())),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((filterCondition) => {
        this.tableSearch()?.onSearch('name', filterCondition);
      });
  }

  private getKeywordColumnIds(): Observable<string[]> {
    return this._screenApiService.getInputsForScreenPost('keyword').pipe(
      map((inputs) => inputs.map((input) => input?.id || '').filter((id) => !!id)),
      catchError((err) => {
        console.error(err);
        return of([]);
      }),
    );
  }
}
