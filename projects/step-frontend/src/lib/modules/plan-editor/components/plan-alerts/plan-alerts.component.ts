import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { PlanContext, ViewRegistryService } from '@exense/step-core';

@Component({
  selector: 'step-plan-alerts',
  templateUrl: './plan-alerts.component.html',
  styleUrls: ['./plan-alerts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlanAlertsComponent {
  readonly planContext = input<PlanContext | null>();

  protected readonly _planAlerts = inject(ViewRegistryService).getDashlets('plan/alerts');

  protected readonly readOnlyFields = computed(() => {
    const planContext = this.planContext();
    const fields = planContext?.entity.customFields;
    return fields?.['readOnly'] === true ? fields : undefined;
  });
}
