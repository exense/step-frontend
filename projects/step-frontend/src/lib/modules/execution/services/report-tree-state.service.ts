import { Injectable } from '@angular/core';
import { TreeStateInitOptions, TreeStateService } from '@exense/step-core';
import { BehaviorSubject, filter, finalize, map, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { ReportNodeWithChildren } from '../shared/report-node-with-children';
import { ReportTreeNode } from '../shared/report-tree-node';
import { ReportTreeNodeUtilsService } from './report-tree-node-utils.service';

export interface ReportTreeStateInitOptions extends TreeStateInitOptions {
  depth?: number;
}

@Injectable()
export class ReportTreeStateService extends TreeStateService<
  ReportNodeWithChildren,
  ReportTreeNode,
  ReportTreeNodeUtilsService
> {
  private depthRestoreTerminator$?: Subject<void>;
  private readonly depthRestorePending$ = new BehaviorSubject(false);

  override init(root?: ReportNodeWithChildren, options: ReportTreeStateInitOptions = {}): void {
    this.cancelDepthRestore();
    const { depth } = options;

    if (!root || depth === undefined) {
      super.init(root, options);
      this.depthRestorePending$.next(false);
      return;
    }

    super.init(root, { ...options, expandAllByDefault: false, hideRoot: false });
    this.hideRootInternal.set(!!options.hideRoot);

    const terminator$ = new Subject<void>();
    this.depthRestoreTerminator$ = terminator$;
    this.depthRestorePending$.next(true);

    this._treeNodeUtils
      .restoreTree(root, depth)
      .pipe(
        takeUntil(terminator$),
        tap(() => {
          if (this.depthRestoreTerminator$ !== terminator$) {
            return;
          }

          this.refresh({ emitTreeUpdate: false });
          this.expandAll();
        }),
        finalize(() => {
          if (this.depthRestoreTerminator$ !== terminator$) {
            return;
          }

          this.depthRestoreTerminator$ = undefined;
          terminator$.complete();
          this.depthRestorePending$.next(false);
        }),
      )
      .subscribe();
  }

  whenDepthRestoreSettled(): Observable<void> {
    return this.depthRestorePending$.pipe(
      filter((pending) => !pending),
      take(1),
      map(() => undefined),
    );
  }

  override cleanup(): boolean {
    this.cancelDepthRestore();
    const result = super.cleanup();
    this.depthRestorePending$.next(false);
    return result;
  }

  override ngOnDestroy(): void {
    this.cancelDepthRestore();
    super.ngOnDestroy();
    this.depthRestorePending$.complete();
  }

  private cancelDepthRestore(): void {
    const terminator$: Subject<void> | undefined = this.depthRestoreTerminator$;
    this.depthRestoreTerminator$ = undefined;
    terminator$?.next();
    terminator$?.complete();
  }
}
