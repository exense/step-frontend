import { TableLocalDataSource } from './table-local-data-source';
import { BehaviorSubject, map, Observable, of, shareReplay, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { TableLocalDataSourceConfig } from './table-local-data-source-config';
import { Mutable } from '../../basics/step-basics.module';
import { StepDataSourceReloadOptions } from '../../../client/table/shared/step-data-source';

interface ReloadOptions<R> extends StepDataSourceReloadOptions {
  request?: R;
}

type FieldAccessor = Mutable<Pick<TableFetchLocalDataSource<any>, 'inProgress$'>>;

interface TableFetchConfig<T, R> extends TableLocalDataSourceConfig<T> {
  initialReloadOptions?: ReloadOptions<R>;
}

export class TableFetchLocalDataSource<T, R = any> extends TableLocalDataSource<T> {
  private inProgressInternal$!: BehaviorSubject<boolean>;

  private reload$?: BehaviorSubject<ReloadOptions<R> | undefined>;
  private pendingReload?: ReloadOptions<R>;

  private currentRequestTerminator$?: Subject<void>;
  private requestRef$?: Observable<T[] | undefined>;

  override readonly inProgress$ = of(false);

  constructor(
    private retrieveData: (request?: R) => Observable<T[] | undefined>,
    config: TableLocalDataSourceConfig<T> = {},
    initialReloadOptions?: ReloadOptions<R>,
  ) {
    super([], { ...config, initialReloadOptions } as TableLocalDataSourceConfig<T>);
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

  protected override setupStreams(ignoredArrayFromConstructor: T[] | Observable<T[]>, config: TableFetchConfig<T, R>) {
    // Initialization of these fields moved inside method `setupStreams`
    // because it is invoked in the constructor.
    // It means that all inline initializations will be done after,
    // but these subject are already required to setup streams
    const reload$ = new BehaviorSubject<ReloadOptions<R> | undefined>(config.initialReloadOptions);
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
      if (this.pendingReload) {
        this.reload$.next(this.pendingReload);
        this.pendingReload = undefined;
      }
    });
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
