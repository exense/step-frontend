import { Component, computed, forwardRef, input, output, TrackByFunction, ViewEncapsulation } from '@angular/core';
import { KeyValue } from '@angular/common';
import { ItemsPerPageService, StepCoreModule, TableIndicatorMode } from '@exense/step-core';
import { Observable, of } from 'rxjs';

const PAGE_SIZE = 8;

@Component({
  selector: 'step-error-root-causes',
  imports: [StepCoreModule],
  providers: [
    {
      provide: ItemsPerPageService,
      useExisting: forwardRef(() => ErrorRootCausesComponent),
    },
  ],
  templateUrl: './error-root-causes.component.html',
  styleUrl: './error-root-causes.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ErrorRootCausesComponent implements ItemsPerPageService {
  readonly data = input.required<KeyValue<string, number>[]>();
  readonly onErrorSearch = output<string>();

  protected readonly trackByItem: TrackByFunction<KeyValue<string, number>> = (index, item) => item.key;

  protected readonly isSimpleView = computed(() => {
    const data = this.data();
    return data.length <= PAGE_SIZE;
  });
  protected readonly TableIndicatorMode = TableIndicatorMode;

  protected readonly totalErrorCount = computed(() => {
    const data = this.data();
    let totalCount = 0;
    for (const entry of data) {
      totalCount += entry.value;
    }
    return totalCount;
  });

  getDefaultPageSizeItem(): Observable<number> {
    return of(PAGE_SIZE);
  }

  getItemsPerPage(): Observable<number[]> {
    return of([PAGE_SIZE]);
  }
}
