import { TableLocalDataSource } from './table-local-data-source';
import { BehaviorSubject, map, Observable, switchMap, tap } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';
import { TableLocalDataSourceConfig } from './table-local-data-source-config';

type ReloadOptions<R> = { hideProgress?: boolean; request?: R } | undefined;

export class TableFetchLocalDataSource<T, R = any> extends TableLocalDataSource<T> {
  private inProgressInternal$!: BehaviorSubject<boolean>;

  private reload$!: BehaviorSubject<ReloadOptions<R>>;

  override readonly inProgress$ = this.inProgressInternal$.asObservable();

  constructor(
    private retrieveData: (request?: R) => Observable<T[]>,
    config: TableLocalDataSourceConfig<T> = {},
    private initialReloadOptions?: ReloadOptions<R>
  ) {
    super([], config);
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

  protected override setupStreams(
    ignoredArrayFromConstructor: T[] | Observable<T[]>,
    config: TableLocalDataSourceConfig<T>
  ) {
    // Initialization of these fields moved inside method `setupStreams`
    // because it is invoked in the constructor.
    // It means that all inline initializations will be done after,
    // but these subject are already required to setup streams
    this.reload$ = new BehaviorSubject<ReloadOptions<R>>(this.initialReloadOptions);
    this.inProgressInternal$ = new BehaviorSubject<boolean>(false);
    const source$ = this.createDataStream();
    super.setupStreams(source$, config);
  }

  private createDataStream(): Observable<T[]> {
    return this.reload$.pipe(
      map((reloadOptions) => reloadOptions || {}),
      tap(({ hideProgress }) => {
        if (!hideProgress) {
          this.inProgressInternal$.next(true);
        }
      }),
      switchMap(({ request }) => this.retrieveData(request)),
      tap(() => this.inProgressInternal$.next(false))
    );
  }
}
