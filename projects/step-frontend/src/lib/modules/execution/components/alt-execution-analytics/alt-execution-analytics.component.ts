import { Component, inject } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { DashboardViewSettingsBtnLocation } from '../../../timeseries/components/dashboard/dashboard-view-settings-btn-location';

@Component({
  selector: 'step-alt-execution-analytics',
  templateUrl: './alt-execution-analytics.component.html',
  styleUrl: './alt-execution-analytics.component.scss',
})
export class AltExecutionAnalyticsComponent {
  readonly _state = inject(AltExecutionStateService);
}
