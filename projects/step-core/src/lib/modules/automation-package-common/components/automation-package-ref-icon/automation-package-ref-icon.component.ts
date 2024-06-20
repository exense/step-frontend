import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EntityAutomationPackageService } from '../../injectables/entity-automation-package.service';
import { Observable, of } from 'rxjs';
import { AutomationPackage } from '../../../../client/generated';
import { AutomationPackageChildEntity } from '../../types/automation-package-child-entity';
import { Router } from '@angular/router';

@Component({
  selector: 'step-automation-package-ref-icon',
  templateUrl: './automation-package-ref-icon.component.html',
  styleUrls: ['./automation-package-ref-icon.component.scss'],
})
export class AutomationPackageRefIconComponent<T extends AutomationPackageChildEntity> implements OnChanges {
  private _router = inject(Router);
  private _entityAutomationPackageService = inject(EntityAutomationPackageService);

  protected automationPackage$: Observable<AutomationPackage | undefined> = of(undefined);

  @Input() entity?: T;

  ngOnChanges(changes: SimpleChanges): void {
    const cEntity = changes['entity'];
    if (cEntity?.previousValue !== cEntity?.currentValue || cEntity?.firstChange) {
      this.automationPackage$ = this._entityAutomationPackageService.getEntityPackage(cEntity?.currentValue);
    }
  }

  openPackageList(automationPackage: AutomationPackage): void {
    const automationPackageFileName = automationPackage.customFields?.['automationPackageFileName'];
    if (!automationPackageFileName) {
      return;
    }
    this._router.navigate(['automation-package', 'list'], {
      queryParams: { automationPackageFileName },
    });
  }
}
