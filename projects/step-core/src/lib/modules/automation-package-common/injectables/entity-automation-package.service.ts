import { inject, Injectable, OnDestroy } from '@angular/core';
import { AugmentedAutomationPackagesService, AutomationPackage, bulkRequest } from '../../../client/step-client-module';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { AutomationPackageChildEntity } from '../types/automation-package-child-entity';

@Injectable({
  providedIn: 'root',
})
export class EntityAutomationPackageService implements OnDestroy {
  private _api = inject(AugmentedAutomationPackagesService);

  private packageId$ = new BehaviorSubject<string | undefined>(undefined);

  private packages$ = this.packageId$.pipe(bulkRequest((ids) => this._api.searchByIDs(ids)));

  ngOnDestroy(): void {
    this.packageId$.complete();
  }

  getEntityPackage<T extends AutomationPackageChildEntity>(entity?: T): Observable<AutomationPackage | undefined> {
    return this.getEntityPackageById(entity?.customFields?.automationPackageId);
  }

  getEntityPackageById(packageId?: string): Observable<AutomationPackage | undefined> {
    if (!packageId) {
      return of(undefined);
    }
    this.packageId$.next(packageId);
    return this.packages$.pipe(map((packages) => packages.get(packageId)));
  }
}
