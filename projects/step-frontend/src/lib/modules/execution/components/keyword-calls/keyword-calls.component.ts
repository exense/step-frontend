import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  Execution,
  Mutable,
  ReportNode,
  TableRemoteDataSource,
  TableApiWrapperService,
  TableSearch,
  FilterConditionFactoryService,
  AugmentedScreenService,
} from '@exense/step-core';
import { map, Observable, of } from 'rxjs';
import { KeywordParameters } from '../../shared/keyword-parameters';
import { REPORT_NODE_STATUS } from '../../../_common/shared/status.enum';
import { catchError } from 'rxjs/operators';

type FieldsAccessor = Mutable<Pick<KeywordCallsComponent, 'showFooter'>>;

@Component({
  selector: 'step-keyword-calls',
  templateUrl: './keyword-calls.component.html',
  styleUrls: ['./keyword-calls.component.scss'],
})
export class KeywordCallsComponent implements OnInit {
  @Input() execution?: Execution;
  @Input() keywordParameters$?: Observable<KeywordParameters>;
  @Output() showNodeInTree = new EventEmitter<string>();
  @Output() showTestCase = new EventEmitter<string>();
  @ViewChild('keywordsTable', { read: TableSearch }) keywordTableSearch!: TableSearch;
  readonly showFooter: boolean = false;
  readonly statusOptions = REPORT_NODE_STATUS;
  readonly EXPORT_FIELDS = [
    'executionTime',
    'name',
    '_class',
    'status',
    'error',
    'input',
    'output',
    'duration',
    'agentUrl',
  ];
  readonly leafReportsDataSource = new TableRemoteDataSource<ReportNode>('leafReports', this._tableRest, {
    executionTime: 'executionTime',
    step: 'step',
    status: 'status',
  });
  readonly rowDetailsVisibilityFlags: { [id: string]: boolean } = {};
  private functionColumnsIds: string[] = [];

  constructor(
    private _tableRest: TableApiWrapperService,
    private _filterConditionFactory: FilterConditionFactoryService,
    private _screenApiService: AugmentedScreenService
  ) {}

  ngOnInit(): void {
    this._screenApiService
      .getInputsForScreenPost('functionTable')
      .pipe(
        map((inputs) => inputs.map((input) => input?.id || '').filter((id) => !!id)),
        catchError((err) => {
          console.error(err);
          return of([]);
        })
      )
      .subscribe((functionColumnIds) => (this.functionColumnsIds = functionColumnIds));
  }

  searchByStep(value: string): void {
    const searchValue = this._filterConditionFactory.reportNodeFilterCondition(value, this.functionColumnsIds);
    this.keywordTableSearch.onSearch('step', searchValue);
  }

  toggleFooter(): void {
    (this as FieldsAccessor).showFooter = !this.showFooter;
  }

  toggleRowDetails(id: string): void {
    this.rowDetailsVisibilityFlags[id] = !this.rowDetailsVisibilityFlags[id];
  }
}
