import { Component, inject } from '@angular/core';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'step-scheduler-page',
  templateUrl: './scheduler-page.component.html',
  styleUrls: ['./scheduler-page.component.scss'],
})
export class SchedulerPageComponent {}
