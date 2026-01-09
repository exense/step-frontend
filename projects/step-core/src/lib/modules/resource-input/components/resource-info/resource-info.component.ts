import { Component, computed, input } from '@angular/core';
import { DateFormat, StepBasicsModule } from '../../../basics/step-basics.module';
import { Resource } from '../../../../client/step-client-module';

@Component({
  selector: 'step-resource-info',
  imports: [StepBasicsModule],
  templateUrl: './resource-info.component.html',
  styleUrl: './resource-info.component.scss',
})
export class ResourceInfoComponent {
  readonly resource = input<Resource | undefined>();

  protected readonly isMaven = computed(() => {
    const library = this.resource();
    const isMaven = library?.origin?.startsWith?.('mvn:');
    return isMaven;
  });

  protected readonly isManaged = computed(() => {
    const library = this.resource();
    const isManaged = library?.resourceType === 'automationPackageManagedLibrary';
    return isManaged;
  });

  protected readonly icon = computed(() => {
    const isMaven = this.isMaven();
    const isManaged = this.isManaged();
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
