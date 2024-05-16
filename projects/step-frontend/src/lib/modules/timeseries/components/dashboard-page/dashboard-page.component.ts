import { Component, inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DashboardUrlParamsService } from '../../modules/_common/injectables/dashboard-url-params.service';
import { COMMON_IMPORTS, ResolutionPickerComponent, TimeRangePickerComponent } from '../../modules/_common';
import { DashboardFilterBarComponent } from '../../modules/filter-bar';
import { ChartDashletComponent } from '../chart-dashlet/chart-dashlet.component';
import { TableDashletComponent } from '../table-dashlet/table-dashlet.component';
import { ActivatedRoute } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { StandaloneChartComponent } from '../standalone-chart/standalone-chart.component';
import { StandaloneChartConfig } from '../standalone-chart/standalone-chart-config';

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
  ],
})
export class DashboardPageComponent implements OnInit {
  private _route: ActivatedRoute = inject(ActivatedRoute);

  dashboardId?: string;

  config: StandaloneChartConfig = {
    colorizationType: 'FILL',
    showLegend: false,
    showTimeAxes: true,
    showYAxes: false,
    zoomEnabled: false,
  };

  ngOnInit(): void {
    this._route.paramMap.subscribe((params) => {
      const id: string = params.get('id')!;
      if (!id) {
        throw new Error('Dashboard id not present');
      }
      this.dashboardId = id;
    });
  }
}
