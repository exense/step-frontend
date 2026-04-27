import { AltReportNodesFilterService } from './alt-report-nodes-filter.service';
import { distinctUntilChanged, Observable, switchMap } from 'rxjs';
import { TableDataSource, TableParameters } from '@exense/step-core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export abstract class AltReportNodesStateService<T> extends AltReportNodesFilterService {
  protected constructor(
    readonly datasource$: Observable<TableDataSource<T>>,
    storagePrefix: string,
  ) {
    super(storagePrefix);
    this.listInProgress$ = datasource$.pipe(
      switchMap((dataSource) => dataSource.inProgress$),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    );
  }

  readonly listInProgress$: Observable<boolean>;

  abstract readonly tableParams$: Observable<TableParameters | undefined>;
}
