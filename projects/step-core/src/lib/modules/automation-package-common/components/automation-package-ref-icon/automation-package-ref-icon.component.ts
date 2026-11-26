import { Component, inject, input } from '@angular/core';
import { EntityAutomationPackageService } from '../../injectables/entity-automation-package.service';
import { of, combineLatest, map, switchMap } from 'rxjs';
import { AutomationPackage } from '../../../../client/generated';
import { AutomationPackageChildEntity } from '../../types/automation-package-child-entity';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../auth';
import { AutomationPackagePermission } from '../../types/automation-package-permission.enum';

@Component({
  selector: 'step-automation-package-ref-icon',
  templateUrl: './automation-package-ref-icon.component.html',
  styleUrls: ['./automation-package-ref-icon.component.scss'],
  standalone: false,
})
export class AutomationPackageRefIconComponent<T extends AutomationPackageChildEntity> {
  private _router = inject(Router);
  private _entityAutomationPackageService = inject(EntityAutomationPackageService);
  private _auth = inject(AuthService);

  readonly entity = input<T | undefined>();

  private readonly entity$ = toObservable(this.entity);
  private readonly isReadPackageAvailable$ = this._auth
    .hasRight$(AutomationPackagePermission.READ)
    .pipe(takeUntilDestroyed());

  private readonly automationPackage$ = combineLatest([this.entity$, this.isReadPackageAvailable$]).pipe(
    switchMap(([entity, isReadPackageAvailable]) => {
      if (!entity || !isReadPackageAvailable) {
        return of(undefined);
      }
      return this._entityAutomationPackageService.getEntityPackage(entity);
    }),
  );

  protected readonly automationPackage = toSignal(this.automationPackage$, { initialValue: undefined });

  protected openPackageList(automationPackage?: AutomationPackage): void {
    const automationPackageFileName = automationPackage?.customFields?.['automationPackageFileName'];
    if (!automationPackageFileName) {
      return;
    }
    this._router.navigate(['automation-package', 'list'], {
      queryParams: { automationPackageFileName },
    });
  }
}
