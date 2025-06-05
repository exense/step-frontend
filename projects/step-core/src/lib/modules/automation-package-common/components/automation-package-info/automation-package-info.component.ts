import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { AutomationPackageChildEntity } from '../../types/automation-package-child-entity';
import { EntityAutomationPackageService } from '../../injectables/entity-automation-package.service';
import { Observable, of } from 'rxjs';
import { AutomationPackage } from '../../../../client/step-client-module';

@Component({
  selector: 'step-automation-package-info',
  templateUrl: './automation-package-info.component.html',
  styleUrls: ['./automation-package-info.component.scss'],
  standalone: false,
})
export class AutomationPackageInfoComponent<T extends AutomationPackageChildEntity>
  implements CustomComponent, OnChanges
{
  private entityAutomationPackageService = inject(EntityAutomationPackageService);

  protected automationPackage$: Observable<AutomationPackage | undefined> = of(undefined);

  @Input() context?: T;

  ngOnChanges(changes: SimpleChanges): void {
    const cContext = changes['context'];
    if (cContext) {
      this.contextChange(cContext.previousValue, cContext.currentValue);
    }
  }

  contextChange(previousContext?: T, currentContext?: T): void {
    if (previousContext !== currentContext) {
      this.automationPackage$ = this.entityAutomationPackageService.getEntityPackage(currentContext);
    }
  }
}
