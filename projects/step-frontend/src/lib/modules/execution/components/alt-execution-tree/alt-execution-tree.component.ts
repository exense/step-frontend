import { Component, DestroyRef, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';

@Component({
  selector: 'step-alt-execution-tree',
  templateUrl: './alt-execution-tree.component.html',
  styleUrl: './alt-execution-tree.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AltExecutionTreeComponent implements OnInit {
  protected readonly _state = inject(AltExecutionStateService);
  private _destroyRef = inject(DestroyRef);
  private _urlParamsService = inject(DashboardUrlParamsService);

  ngOnInit(): void {
    this._state.timeRangePickerChange$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((timeRange) => {
      // update URL every time the page is accessed
      this._urlParamsService.updateUrlParams(timeRange);
    });
  }
}
