import { Injectable, OnDestroy } from '@angular/core';
import { ReportNode } from '@exense/step-core';

@Injectable()
export class AltReportNodeDetailsStateService implements OnDestroy {
  private reportNodes = new Map<string, ReportNode>();

  setReportNode<T extends ReportNode>(reportNode: T): void {
    const id = reportNode.id!;
    this.reportNodes.set(id, reportNode);
  }

  getReportNode(id: string): ReportNode | undefined {
    return this.reportNodes.get(id);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  cleanup(): boolean {
    this.reportNodes.clear();
    return true;
  }
}
