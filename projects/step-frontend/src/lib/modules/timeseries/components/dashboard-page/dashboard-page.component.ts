import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { COMMON_IMPORTS, ResolutionPickerComponent } from '../../modules/_common';
import { DashboardFilterBarComponent } from '../../modules/filter-bar';
import { ChartDashletComponent } from '../chart-dashlet/chart-dashlet.component';
import { TableDashletComponent } from '../table-dashlet/table-dashlet.component';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { StandaloneChartComponent } from '../standalone-chart/standalone-chart.component';
import { TimeRangePickerComponent } from '../../modules/_common/components/time-range-picker/time-range-picker.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'step-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    DashboardFilterBarComponent,
    ChartDashletComponent,
    ResolutionPickerComponent,
    TimeRangePickerComponent,
    TableDashletComponent,
    DashboardComponent,
    StandaloneChartComponent,
    MatProgressSpinner,
  ],
})
export class DashboardPageComponent implements OnInit {
  private _route: ActivatedRoute = inject(ActivatedRoute);
  private _router: Router = inject(Router);
  private _destroyRef = inject(DestroyRef);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChildren(DashboardComponent) dashboard?: DashboardComponent;

  dashboardId = input<string>(); // optional, otherwise it will be taken from url

  dashboardIdEffect = effect(() => {
    let dashboardId = this.dashboardId();
    if (dashboardId) {
      this.dashboardIdInternal = dashboardId;
    }
  });

  dashboardIdInternal?: string;

  ngOnInit(): void {
    this._route.paramMap.subscribe((params) => {
      const id: string = params.get('id')!;
      if (!id) {
        throw new Error('Dashboard id not present');
      }
      this.dashboardIdInternal = id;
    });
    this.subscribeToUrlNavigation();
  }

  private subscribeToUrlNavigation() {
    // subscribe to back and forward events
    this._router.events
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        filter((event) => event instanceof NavigationStart),
        filter((event: NavigationStart) => event.navigationTrigger === 'popstate'),
      )
      .subscribe(() => {
        const actualDashboardId = this.dashboardIdInternal;
        this.dashboardIdInternal = undefined;
        this._changeDetectorRef.detectChanges();
        this.dashboardIdInternal = actualDashboardId;
      });
  }
}
