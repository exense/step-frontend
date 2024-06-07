import { inject, Injectable, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, from, Observable, of, pairwise, switchMap, take, timer } from 'rxjs';
import { ALT_EXECUTION_REPORT_IN_PROGRESS } from './alt-execution-report-in-progress.token';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class AltExecutionReportPrintService implements OnDestroy {
  private _doc = inject(DOCUMENT);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _inProgress$ = inject(ALT_EXECUTION_REPORT_IN_PROGRESS).pipe(takeUntilDestroyed());

  private handleAfterPrint = () => this.afterPrint();

  ngOnDestroy() {
    this._doc.defaultView?.removeEventListener('afterprint', this.handleAfterPrint);
  }

  printFiltered(): void {
    this.print();
  }

  printAll(): void {
    this.print(true);
  }

  private readyToPrint(): Observable<any> {
    const currentProgress$ = this._inProgress$.pipe(take(1));

    const preparationStopped$ = this._inProgress$.pipe(
      pairwise(),
      // check switch from `inProgress === true` to `inProgress === false`
      filter(([oldState, newState]) => oldState && !newState),
      take(1),
    );

    return timer(1000).pipe(
      switchMap(() => currentProgress$),
      switchMap((currentProgress) => {
        if (currentProgress) {
          return preparationStopped$;
        }
        return of(undefined);
      }),
      switchMap(() => timer(300)),
    );
  }

  private print(isPrintAll?: boolean): void {
    this._doc.defaultView?.addEventListener('afterprint', this.handleAfterPrint);

    from(
      this._router.navigate(['.', 'report-print'], {
        relativeTo: this._activatedRoute,
        queryParams: {
          viewAll: isPrintAll || null,
        },
        queryParamsHandling: 'merge',
      }),
    )
      .pipe(switchMap(() => this.readyToPrint()))
      .subscribe(() => {
        this._doc.defaultView?.print();
      });
  }

  private afterPrint(): void {
    this._doc.defaultView?.removeEventListener('afterprint', this.handleAfterPrint);
    this._router.navigate(['.', 'report'], {
      relativeTo: this._activatedRoute,
      queryParams: { viewAll: null },
      queryParamsHandling: 'merge',
    });
  }
}
