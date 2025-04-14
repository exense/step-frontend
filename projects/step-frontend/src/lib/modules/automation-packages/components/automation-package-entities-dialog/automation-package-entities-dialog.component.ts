import { Component, computed, effect, inject, model, signal } from '@angular/core';
import {
  AbstractOrganizableObject,
  AugmentedAutomationPackagesService,
  EntityRegistry,
  StepCoreModule,
  Tab,
  TableLocalDataSource,
} from '@exense/step-core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, Observable, of, switchMap, tap } from 'rxjs';
import { AutomationPackageEntityKey } from '../../types/automation-package-entity-key.enum';
import { ENTITIES_DICTIONARY } from '../../injectables/entities-dictionary.token';
import { TablePlansComponent } from '../table-plans/table-plans.component';
import { TableKeywordsComponent } from '../table-keywords/table-keywords.component';
import { TableTasksComponent } from '../table-tasks/table-tasks.component';
import { TableParametersComponent } from '../table-parameters/table-parameters.component';

interface AutomationPackageEntitiesDialogData {
  readonly automationPackageId: string;
}

type EntitiesDictionary = Record<AutomationPackageEntityKey, AbstractOrganizableObject[]>;

@Component({
  selector: 'step-automation-package-entities-dialog',
  standalone: true,
  imports: [StepCoreModule, TablePlansComponent, TableKeywordsComponent, TableTasksComponent, TableParametersComponent],
  templateUrl: './automation-package-entities-dialog.component.html',
  styleUrl: './automation-package-entities-dialog.component.scss',
})
export class AutomationPackageEntitiesDialogComponent {
  private _id = inject<AutomationPackageEntitiesDialogData>(MAT_DIALOG_DATA).automationPackageId;
  private _api = inject(AugmentedAutomationPackagesService);
  protected _entitiesDictionary = inject(ENTITIES_DICTIONARY);
  private _entities = inject(EntityRegistry);

  private TABS_ORDER = [
    AutomationPackageEntityKey.PLANS,
    AutomationPackageEntityKey.PARAMETERS,
    AutomationPackageEntityKey.KEYWORDS,
    AutomationPackageEntityKey.SCHEDULES,
  ];

  protected inProgress = signal(false);

  private entitiesData = toSignal(
    of(this._id).pipe(
      tap(() => this.inProgress.set(true)),
      switchMap((id) => this._api.listEntities(id) as Observable<EntitiesDictionary>),
      catchError((err) => {
        console.error(err);
        return of({} as EntitiesDictionary);
      }),
      finalize(() => this.inProgress.set(false)),
    ),
    { initialValue: {} as EntitiesDictionary },
  );

  protected dataSources = computed(() => {
    const entitiesData = this.entitiesData();
    return Object.entries(entitiesData).reduce(
      (res, [key, value]) => {
        res[key as AutomationPackageEntityKey] = new TableLocalDataSource(value);
        return res;
      },
      {} as Record<AutomationPackageEntityKey, TableLocalDataSource<AbstractOrganizableObject>>,
    );
  });

  protected tabs = computed(() => {
    const entitiesData = this.entitiesData();
    return this.TABS_ORDER.filter((key) => !!entitiesData[key]).map((key) => {
      const entity = this._entities.getEntityByName(this._entitiesDictionary[key]);
      return {
        id: key,
        label: entity.displayName,
      } as Tab<AutomationPackageEntityKey>;
    });
  });

  protected selectedTab = model<AutomationPackageEntityKey | undefined>(undefined);

  private effectInitializeTab = effect(
    () => {
      const firstTab = this.tabs()[0]?.id;
      this.selectedTab.set(firstTab);
    },
    { allowSignalWrites: true },
  );

  protected readonly AutomationPackageEntityKey = AutomationPackageEntityKey;
}
