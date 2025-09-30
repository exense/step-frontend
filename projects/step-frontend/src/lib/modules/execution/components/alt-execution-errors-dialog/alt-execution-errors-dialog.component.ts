import { Component, inject } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { TableLocalDataSource, TimeSeriesErrorEntry } from '@exense/step-core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'step-alt-execution-errors-dialog',
  templateUrl: './alt-execution-errors-dialog.component.html',
  styleUrl: './alt-execution-errors-dialog.component.scss',
  standalone: false,
})
export class AltExecutionErrorsDialogComponent {
  private _state = inject(AltExecutionStateService);

  private errors$ = toObservable(this._state.errors).pipe(map((errors) => errors ?? [])) as Observable<
    TimeSeriesErrorEntry[]
  >;

  protected readonly dataSource = new TableLocalDataSource<TimeSeriesErrorEntry>(
    this.errors$,
    TableLocalDataSource.configBuilder<TimeSeriesErrorEntry>()
      .addSearchNumberPredicate('errorCode', (item) => item.errorCode)
      .addCustomSearchPredicate('types', (item, searchValue) => {
        const search = new RegExp(searchValue, 'ig');
        return item.types.some((type) => search.test(type));
      })
      .addSortNumberPredicate('errorCode', (item) => item.errorCode)
      .addSortNumberPredicate('count', (item) => item.count)
      .addSortNumberPredicate('percentage', (item) => item.percentage)
      .build(),
  );
}
