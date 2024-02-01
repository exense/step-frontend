import { inject, Injectable } from '@angular/core';
import {
  AugmentedAutomationPackagesService,
  AutomationPackage,
  DialogsService,
  MultipleProjectsService,
} from '@exense/step-core';
import { map, Observable, of, switchMap } from 'rxjs';
import { ENTITY_ID, PATH } from '../types/constants';
import { Router } from '@angular/router';

const ROOT_URL = `/root/${PATH}/list`;

@Injectable({
  providedIn: 'root',
})
export class AutomationPackagesActionsService {
  private _dialogs = inject(DialogsService);
  private _api = inject(AugmentedAutomationPackagesService);
  private _multipleProjects = inject(MultipleProjectsService);
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
      })
    );
  }

  createAutomationPackage(): void {
    this._router.navigateByUrl(`${ROOT_URL}/upload/new`);
  }

  editAutomationPackage(automationPackage: AutomationPackage): void {
    const url = `${ROOT_URL}/upload/${automationPackage.id}`;
    if (this._multipleProjects.isEntityBelongsToCurrentProject(automationPackage)) {
      this._router.navigateByUrl(url);
      return;
    }

    this._multipleProjects
      .confirmEntityEditInASeparateProject(automationPackage, url, ENTITY_ID)
      .subscribe((continueEdit) => {
        if (continueEdit) {
          this._router.navigateByUrl(url);
        }
      });
  }
}
