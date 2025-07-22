import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ExecutionViewServices } from '../../types/execution-view-services';
import { Operation, SystemService } from '@exense/step-core';

@Component({
  selector: 'step-current-operations',
  templateUrl: './current-operations.component.html',
  styleUrls: ['./current-operations.component.css'],
  standalone: false,
})
export class CurrentOperationsComponent implements OnChanges {
  private showAllInternal: boolean = false;

  get showAll(): boolean {
    return this.showAllInternal;
  }

  @Input() set showAll(value: boolean) {
    if (this.showAll === value) {
      return;
    }
    this.showAllInternal = value;
    this.showAllChange.emit(value);
  }

  @Output() showAllChange = new EventEmitter<boolean>();

  @Input() reportNodeId?: string;

  @Input() executionViewServices?: ExecutionViewServices;

  currentOperation: Operation[] = [];

  constructor(private _api: SystemService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const cReportNodeId = changes['reportNodeId'];
    if (cReportNodeId?.currentValue !== cReportNodeId?.previousValue) {
      this.getOperation(cReportNodeId?.currentValue);
    }
  }

  private getOperation(reportNodeId?: string): void {
    if (!reportNodeId) {
      this.currentOperation = [];
      return;
    }
    this._api.getOperationsByReportNodeId(reportNodeId).subscribe((data) => {
      this.currentOperation = data;
    });
  }
}
