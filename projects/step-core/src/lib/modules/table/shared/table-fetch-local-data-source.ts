import { TableLocalDataSource } from './table-local-data-source';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';
import { TableLocalDataSourceConfig } from './table-local-data-source-config';
import { Mutable } from '../../../shared';

type ReloadOptions<R> = { hideProgress?: boolean; request?: R } | undefined;
type FieldAccessor = Mutable<Pick<TableFetchLocalDataSource<any>, 'inProgress$'>>;

interface TableFetchConfig<T, R> extends TableLocalDataSourceConfig<T> {
  initialReloadOptions?: ReloadOptions<R>;
}

export class TableFetchLocalDataSource<T, R = any> extends TableLocalDataSource<T> {
  private inProgressInternal$!: BehaviorSubject<boolean>;

  private reload$!: BehaviorSubject<ReloadOptions<R>>;

  override readonly inProgress$ = of(false);

  constructor(
    private retrieveData: (request?: R) => Observable<T[]>,
    config: TableLocalDataSourceConfig<T> = {},
    initialReloadOptions?: ReloadOptions<R>
  ) {
    super([], { ...config, initialReloadOptions } as TableLocalDataSourceConfig<T>);
  }

  override reload(reloadOptions?: ReloadOptions<R>): void {
    this.reload$.next(reloadOptions);
  }

  override disconnect(collectionViewer: CollectionViewer) {
    super.disconnect(collectionViewer);
    this.inProgressInternal$.complete();
    this.reload$.complete();
    (this.retrieveData as unknown) = undefined;
  }

  protected override setupStreams(ignoredArrayFromConstructor: T[] | Observable<T[]>, config: TableFetchConfig<T, R>) {
    // Initialization of these fields moved inside method `setupStreams`
    // because it is invoked in the constructor.
    // It means that all inline initializations will be done after,
    // but these subject are already required to setup streams
    const reload$ = new BehaviorSubject<ReloadOptions<R>>(config.initialReloadOptions);
    const inProgressInternal$ = new BehaviorSubject<boolean>(false);

    const source$ = this.createDataStream(reload$, inProgressInternal$);
    super.setupStreams(source$, config);

    // Assigning to the class fields is done asynchronously,
    // because field definition is read like field initialization, which is invoked after constructor.
    // It will override the value in case if it was assigned during the base constructor invocation.
    queueMicrotask(() => {
      this.reload$ = reload$;
      this.inProgressInternal$ = inProgressInternal$;
      (this as FieldAccessor).inProgress$ = inProgressInternal$.asObservable();
    });
  }

  private createDataStream(
    reload$: BehaviorSubject<ReloadOptions<R>>,
    inProgressInternal$: BehaviorSubject<boolean>
  ): Observable<T[]> {
    return reload$.pipe(
      map((reloadOptions) => reloadOptions || {}),
      tap(({ hideProgress }) => {
        if (!hideProgress) {
          inProgressInternal$.next(true);
        }
      }),
      switchMap(({ request }) => this.retrieveData(request)),
      tap(() => inProgressInternal$.next(false))
    );
  }
}
