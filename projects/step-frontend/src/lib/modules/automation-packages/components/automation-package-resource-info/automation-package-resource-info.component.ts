import { Component, computed, input } from '@angular/core';
import { DateFormat, Resource, StepBasicsModule } from '@exense/step-core';
import { AutomationPackageResourceType } from '../../types/automation-package-resource-type.enum';

@Component({
  selector: 'step-automation-package-resource-info',
  imports: [StepBasicsModule],
  templateUrl: './automation-package-resource-info.component.html',
  styleUrl: './automation-package-resource-info.component.scss',
})
export class AutomationPackageResourceInfoComponent {
  readonly resource = input<Resource | undefined>();

  protected readonly isMaven = computed(() => {
    const library = this.resource();
    const isMaven = library?.origin?.startsWith?.('mvn:');
    return isMaven;
  });

  protected readonly icon = computed(() => {
    const library = this.resource();
    const isManaged = library?.resourceType === AutomationPackageResourceType.AUTOMATION_PACKAGE_MANAGED_LIBRARY;
    const isMaven = library?.origin?.startsWith?.('mvn:');
    if (isMaven) {
      if (isManaged) {
        return 'managed-maven';
      } else {
        return 'maven';
      }
    }

    if (isManaged) {
      return 'managed-file';
    }

    return 'file';
  });
  protected readonly DateFormat = DateFormat;
}
