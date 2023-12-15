import { Component, inject, Input, TrackByFunction } from '@angular/core';
import { Dashlet, Plan, ViewRegistryService } from '@exense/step-core';

@Component({
  selector: 'step-plan-alerts',
  templateUrl: './plan-alerts.component.html',
  styleUrls: ['./plan-alerts.component.scss'],
})
export class PlanAlertsComponent {
  @Input() plan?: Plan | null;

  readonly _planAlerts = inject(ViewRegistryService).getDashlets('plan/alerts');
  readonly trackByDashlet: TrackByFunction<Dashlet> = (index, item) => item.id;
}
