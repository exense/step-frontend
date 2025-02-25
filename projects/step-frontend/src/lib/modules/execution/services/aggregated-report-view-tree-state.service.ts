import { Injectable, InjectionToken, OnDestroy, signal } from '@angular/core';
import { AggregatedReport, AggregatedReportView, TreeStateInitOptions, TreeStateService } from '@exense/step-core';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';

export type AggregatedTreeStateInitOptions = TreeStateInitOptions & Pick<AggregatedReport, 'resolvedPartialPath'>;

@Injectable()
export class AggregatedReportViewTreeStateService extends TreeStateService<AggregatedReportView, AggregatedTreeNode> {
  private resolvedPartialPathInternal = signal<string | undefined>(undefined);
  readonly resolvedPartialPath = this.resolvedPartialPathInternal.asReadonly();

  override init(root: AggregatedReportView, options: AggregatedTreeStateInitOptions = {}) {
    super.init(root, options);
    this.resolvedPartialPathInternal.set(options?.resolvedPartialPath);
  }
}

export const AGGREGATED_TREE_TAB_STATE = new InjectionToken<AggregatedReportViewTreeStateService>(
  'Tree state related to tab',
);
export const AGGREGATED_TREE_WIDGET_STATE = new InjectionToken<AggregatedReportViewTreeStateService>(
  'Tree state related to widget',
);

@Injectable()
export class AggregatedReportViewTreeStateContextService implements OnDestroy {
  private state?: AggregatedReportViewTreeStateService;

  setState(state: AggregatedReportViewTreeStateService): void {
    this.state = state;
  }

  getState(): AggregatedReportViewTreeStateService {
    if (!this.state) {
      throw new Error(`Three state hasn't been initialized.`);
    }
    return this.state;
  }

  ngOnDestroy(): void {
    this.state = undefined;
  }
}
