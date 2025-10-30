import { inject, Injectable } from '@angular/core';
import { AugmentedAutomationPackagesService, AutomationPackage, DialogsService } from '@exense/step-core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { PATH } from '../types/constants';
import { Router } from '@angular/router';

const ROOT_URL = `/${PATH}/list`;

@Injectable({
  providedIn: 'root',
})
export class AutomationPackagesActionsService {
  private _dialogs = inject(DialogsService);
  private _api = inject(AugmentedAutomationPackagesService);
  private _router = inject(Router);

  readonly rootUrl = ROOT_URL;

  deleteAutomationPackage(automationPackage: AutomationPackage): Observable<boolean> {
    const id = automationPackage.id;
    if (!id) {
      return of(false);
    }
    const name = automationPackage.attributes?.['name'];

    return this._dialogs.showDeleteWarning(1, `Automation package "${name ?? id}"`).pipe(
      switchMap((isDeleteConfirmed) => {
        if (isDeleteConfirmed) {
          return this._api.deleteAutomationPackage(id).pipe(map(() => true));
        }
        return of(isDeleteConfirmed);
      }),
    );
  }

  refreshAutomationPackage(automationPackage: AutomationPackage): Observable<boolean> {
    const id = automationPackage.id;
    if (!id) {
      return of(false);
    }
    return this._api.refreshAutomationPackage(id).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  createAutomationPackage(): void {
    this._router.navigateByUrl(`${ROOT_URL}/upload/new`);
  }

  executeAutomationPackage(automationPackage: AutomationPackage): void {
    this._router.navigateByUrl(`/${ROOT_URL}/execute/${automationPackage.id}`);
  }

  editAutomationPackage(automationPackage: AutomationPackage): void {
    const url = `${ROOT_URL}/upload/${automationPackage.id}`;
    this._router.navigateByUrl(url);
  }

  showAutomationPackageEntities(automationPackage: AutomationPackage): void {
    this._router.navigateByUrl(`${ROOT_URL}/entities/${automationPackage.id}`);
  }
}
