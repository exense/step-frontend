import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CustomRegistryService, CustomRegistryType, StepCoreModule } from '@exense/step-core';

@Component({
  selector: 'step-automation-package-entity-table',
  standalone: true,
  imports: [StepCoreModule],
  templateUrl: './automation-package-entity-table.component.html',
  styleUrl: './automation-package-entity-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomationPackageEntityTableComponent {
  private _customRegistry = inject(CustomRegistryService);

  readonly entityType = input.required<string>();
  readonly automationPackageId = input.required<string>();

  protected readonly tableComponent = computed(() => {
    const entityType = this.entityType();
    return this._customRegistry.getRegisteredItem(CustomRegistryType.AUTOMATION_PACKAGE_ENTITY_TABLE, entityType)
      ?.component;
  });
}
