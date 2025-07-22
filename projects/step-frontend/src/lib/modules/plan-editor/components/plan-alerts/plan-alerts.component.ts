import { Component, inject, Input } from '@angular/core';
import { PlanContext, ViewRegistryService } from '@exense/step-core';

@Component({
  selector: 'step-plan-alerts',
  templateUrl: './plan-alerts.component.html',
  styleUrls: ['./plan-alerts.component.scss'],
  standalone: false,
})
export class PlanAlertsComponent {
  @Input() planContext?: PlanContext | null;

  readonly _planAlerts = inject(ViewRegistryService).getDashlets('plan/alerts');
}
