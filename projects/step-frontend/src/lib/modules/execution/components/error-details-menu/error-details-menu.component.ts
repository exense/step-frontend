import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { DateFormat } from '@exense/step-core';
import { TimeSeriesEntityService } from '../../../timeseries/modules/_common';
import { DOCUMENT } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'step-error-details-menu',
  templateUrl: './error-details-menu.component.html',
  styleUrls: ['./error-details-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDetailsMenuComponent {
  private _doc = inject(DOCUMENT);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);
  readonly DateFormat = DateFormat;

  /** @Input() **/
  readonly executionIds = input<string[]>([]);

  /** @Input() **/
  readonly truncated = input<boolean>(false);

  protected loading = signal(false);

  private executions$ = toObservable(this.executionIds).pipe(
    switchMap((ids) => {
      if (!ids?.length) {
        return of([]);
      }
      this.loading.set(true);
      return this._timeSeriesEntityService.getExecutions(ids).pipe(
        catchError(() => of([])),
        finalize(() => this.loading.set(false)),
        map((executions) => executions.sort((e1, e2) => e1.startTime! - e2.startTime!)),
      );
    }),
  );

  protected readonly executions = toSignal(this.executions$, { initialValue: [] });

  protected jumpToExecution(eId: string) {
    this._doc.defaultView?.open(`#/executions/${eId!}/viz`);
  }
}
