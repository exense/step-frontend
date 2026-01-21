import { TableLocalDataSource, TableLocalDataSourceSetupResult } from './table-local-data-source';
import { BehaviorSubject, map, Observable, shareReplay, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { TableLocalDataSourceConfig } from './table-local-data-source-config';
import { StepDataSourceReloadOptions } from '../../../client/table/shared/step-data-source';

interface ReloadOptions<R> extends StepDataSourceReloadOptions {
  request?: R;
}

type TableFetchLocalDataSourceSetupResult<R> = TableLocalDataSourceSetupResult & {
  inProgressInternal$: BehaviorSubject<boolean>;
  reload$: BehaviorSubject<ReloadOptions<R> | undefined>;
};

interface TableFetchConfig<T, R> extends TableLocalDataSourceConfig<T> {
  initialReloadOptions?: ReloadOptions<R>;
}

export class TableFetchLocalDataSource<T, R = any> extends TableLocalDataSource<
  T,
  TableFetchLocalDataSourceSetupResult<R>
> {
  private inProgressInternal$!: BehaviorSubject<boolean>;
  private reload$!: BehaviorSubject<ReloadOptions<R> | undefined>;

  private pendingReload?: ReloadOptions<R>;

  private currentRequestTerminator$?: Subject<void>;
  private requestRef$?: Observable<T[] | undefined>;

  constructor(
    private retrieveData: (request?: R) => Observable<T[] | undefined>,
    config: TableLocalDataSourceConfig<T> = {},
    initialReloadOptions?: ReloadOptions<R>,
  ) {
    super([], { ...config, initialReloadOptions } as TableLocalDataSourceConfig<T>);
    this.inProgressInternal$ = this.fields.inProgressInternal$;
    this.reload$ = this.fields.reload$;
    if (this.pendingReload) {
      this.reload$.next(this.pendingReload);
      this.pendingReload = undefined;
    }
  }

  override reload(reloadOptions?: ReloadOptions<R>): void {
    if (!this.reload$) {
      this.pendingReload = reloadOptions;
      return;
    }
    this.reload$.next(reloadOptions);
  }

  override destroy(): void {
    super.destroy();
    this.inProgressInternal$?.complete();
    this.reload$?.complete();
    (this.retrieveData as unknown) = undefined;
    this.terminateCurrentRequest();
  }

  protected override setupStreams(
    ignoredArrayFromConstructor: T[] | Observable<T[]>,
    config: TableFetchConfig<T, R>,
  ): TableFetchLocalDataSourceSetupResult<R> {
    const reload$ = new BehaviorSubject<ReloadOptions<R> | undefined>(config.initialReloadOptions);
    const inProgressInternal$ = new BehaviorSubject<boolean>(false);
    const inProgress$ = inProgressInternal$.asObservable();

    const source$ = this.createDataStream(reload$, inProgressInternal$);
    const fields = super.setupStreams(source$, config);
    return {
      ...fields,
      reload$,
      inProgressInternal$,
      inProgress$,
    };
  }

  private terminateCurrentRequest(): void {
    this.currentRequestTerminator$?.next?.();
    this.currentRequestTerminator$?.complete?.();
    this.currentRequestTerminator$ = undefined;
    this.requestRef$ = undefined;
  }

  private createDataStream(
    reload$: BehaviorSubject<ReloadOptions<R> | undefined>,
    inProgressInternal$: BehaviorSubject<boolean>,
  ): Observable<T[] | undefined> {
    return reload$.pipe(
      map((reloadOptions) => reloadOptions || {}),
      switchMap(({ immediateHideProgress, hideProgress, isForce, request }) => {
        if (!isForce && this.requestRef$) {
          return this.requestRef$;
        }

        const isProgressTriggered = !hideProgress && !immediateHideProgress;
        if (isProgressTriggered) {
          inProgressInternal$.next(true);
        }

        if (immediateHideProgress) {
          inProgressInternal$.next(false);
        }

        this.terminateCurrentRequest();
        this.currentRequestTerminator$ = new Subject();
        this.requestRef$ = this.retrieveData(request).pipe(
          tap(() => {
            if (isProgressTriggered) {
              inProgressInternal$.next(false);
            }
            this.requestRef$ = undefined;
          }),
          takeUntil(this.currentRequestTerminator$),
          shareReplay(1),
        );

        return this.requestRef$;
      }),
    );
  }
}
