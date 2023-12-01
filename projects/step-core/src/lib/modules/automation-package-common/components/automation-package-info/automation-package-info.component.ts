import { Component, inject, OnInit } from '@angular/core';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { AutomationPackageChildEntity } from '../../types/automation-package-child-entity';
import { EntityAutomationPackageService } from '../../injectables/entity-automation-package.service';
import { Observable, of } from 'rxjs';
import { AutomationPackage } from '../../../../client/step-client-module';

@Component({
  selector: 'step-automation-package-info',
  templateUrl: './automation-package-info.component.html',
  styleUrls: ['./automation-package-info.component.scss'],
})
export class AutomationPackageInfoComponent<T extends AutomationPackageChildEntity> implements CustomComponent {
  private entityAutomationPackageService = inject(EntityAutomationPackageService);

  protected automationPackage$: Observable<AutomationPackage | undefined> = of(undefined);

  context?: T;

  contextChange(previousContext?: T, currentContext?: T): void {
    if (previousContext !== currentContext) {
      this.automationPackage$ = this.entityAutomationPackageService.getEntityPackage(currentContext);
    }
  }
}
