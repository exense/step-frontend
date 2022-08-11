import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Execution, Mutable, ReportNode, TableRemoteDataSource, TableRestService } from '@exense/step-core';
import { Observable } from 'rxjs';
import { KeywordParameters } from '../../shared/keyword-parameters';

type FieldsAccessor = Mutable<Pick<KeywordCallsComponent, 'showFooter'>>;

@Component({
  selector: 'step-keyword-calls',
  templateUrl: './keyword-calls.component.html',
  styleUrls: ['./keyword-calls.component.scss'],
})
export class KeywordCallsComponent {
  @Input() execution?: Execution;
  @Input() keywordParameters$?: Observable<KeywordParameters>;
  @Input() statusOptions$?: Observable<string[]>;

  @Output() showNodeInTree = new EventEmitter<string>();
  @Output() showTestCase = new EventEmitter<string>();

  readonly showFooter: boolean = false;

  readonly leafReportsDataSource = new TableRemoteDataSource<ReportNode>('leafReports', this._tableRest, {
    executionTime: 'executionTime',
    step: 'step',
    status: 'status',
  });

  readonly rowDetailsVisibilityFlags: { [id: string]: boolean } = {};

  constructor(private _tableRest: TableRestService) {}

  toggleFooter(): void {
    (this as FieldsAccessor).showFooter = !this.showFooter;
  }

  toggleRowDetails(id: string): void {
    this.rowDetailsVisibilityFlags[id] = !this.rowDetailsVisibilityFlags[id];
  }
}
