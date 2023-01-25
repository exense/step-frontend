import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateFormat, Measure, ReportNode } from '@exense/step-core';
import { ReportNodeType } from '../../shared/report-node-type.enum';

@Component({
  selector: 'step-call-function-report-node',
  templateUrl: './call-function-report-node.component.html',
  styleUrls: ['./call-function-report-node.component.scss'],
})
export class CallFunctionReportNodeComponent implements OnChanges {
  readonly DateFormat = DateFormat;

  @Input() node!: ReportNode | any | { measures: Measure[] };
  @Input() children!: ReportNode[];

  displayChildren: ReportNode[] = [];

  hideMeasures: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    const cChildren = changes['children'];
    if (cChildren?.previousValue !== cChildren?.currentValue || cChildren?.firstChange) {
      this.filterChildren(cChildren?.currentValue);
    }
  }

  private filterChildren(children?: ReportNode[]): void {
    this.displayChildren = (children || []).filter((child) =>
      ([ReportNodeType.AssertReportNode, ReportNodeType.PerformanceAssertReportNode] as string[]).includes(child._class)
    );
  }
}
