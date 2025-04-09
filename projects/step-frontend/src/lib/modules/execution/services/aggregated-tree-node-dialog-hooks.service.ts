import { ReportNode } from '@exense/step-core';
import { Injectable } from '@angular/core';

export interface AggregatedTreeNodeDialogHooksStrategy {
  reportNodeOpened(reportNode: ReportNode): void;
}

@Injectable({
  providedIn: 'root',
})
export class AggregatedTreeNodeDialogHooksService implements AggregatedTreeNodeDialogHooksStrategy {
  private strategy?: AggregatedTreeNodeDialogHooksStrategy;

  useStrategy(strategy: AggregatedTreeNodeDialogHooksStrategy) {
    this.strategy = strategy;
  }

  cleanupStrategy(): void {
    this.strategy = undefined;
  }

  reportNodeOpened(reportNode: ReportNode): void {
    this.strategy?.reportNodeOpened?.(reportNode);
  }
}
