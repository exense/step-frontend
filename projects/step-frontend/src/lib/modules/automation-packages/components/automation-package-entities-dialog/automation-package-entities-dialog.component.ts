import { Component, computed, effect, inject, model, signal, ViewEncapsulation } from '@angular/core';
import {
  AbstractOrganizableObject,
  AugmentedAutomationPackagesService,
  AutomationPackageEntityTableRegistryService,
  StepCoreModule,
  Tab,
  TableLocalDataSource,
} from '@exense/step-core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, Observable, of, switchMap, tap } from 'rxjs';
import { AutomationPackageEntityKey } from '../../types/automation-package-entity-key.enum';
import { AutomationPackageEntityTableComponent } from '../automation-package-entity-table/automation-package-entity-table.component';

interface AutomationPackageEntitiesDialogData {
  readonly automationPackageId: string;
}

type EntitiesDictionary = Record<string, AbstractOrganizableObject[]>;

const MAIN_TABS_ORDER = [
  AutomationPackageEntityKey.PLANS,
  AutomationPackageEntityKey.PARAMETERS,
  AutomationPackageEntityKey.KEYWORDS,
  AutomationPackageEntityKey.SCHEDULES,
];

@Component({
  selector: 'step-automation-package-entities-dialog',
  standalone: true,
  imports: [StepCoreModule, AutomationPackageEntityTableComponent],
  templateUrl: './automation-package-entities-dialog.component.html',
  styleUrl: './automation-package-entities-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AutomationPackageEntitiesDialogComponent {
  private _id = inject<AutomationPackageEntitiesDialogData>(MAT_DIALOG_DATA).automationPackageId;
  private _api = inject(AugmentedAutomationPackagesService);
  private _entityTablesRegistry = inject(AutomationPackageEntityTableRegistryService);

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

  private dataSources = computed(() => {
    const entitiesData = this.entitiesData();
    return Object.entries(entitiesData).reduce(
      (res, [key, value]) => {
        res[key] = new TableLocalDataSource(value);
        return res;
      },
      {} as Record<string, TableLocalDataSource<AbstractOrganizableObject>>,
    );
  });

  protected tabs = computed(() => this.createTabs(this.entitiesData()));

  protected selectedTab = model<string | undefined>(undefined);

  protected readonly tableContext = computed(() => {
    const entity = this.selectedTab();
    const dataSources = this.dataSources();
    if (!entity || !dataSources?.[entity]) {
      return undefined;
    }
    const dataSource = dataSources[entity];
    return {
      entity,
      dataSource,
    };
  });

  protected readonly dataSource = computed(() => {
    const selectedTab = this.selectedTab();
    const dataSources = this.dataSources();
    return selectedTab ? dataSources?.[selectedTab] : undefined;
  });

  private effectInitializeTab = effect(
    () => {
      const firstTab = this.tabs()[0]?.id;
      this.selectedTab.set(firstTab);
    },
    { allowSignalWrites: true },
  );

  private createTabs(entitiesData: EntitiesDictionary): Tab<string>[] {
    const registeredEntitiesKeys = this._entityTablesRegistry.getItemInfos().map((item) => item.type);
    const predefinedTabs = MAIN_TABS_ORDER.filter((item) => registeredEntitiesKeys.includes(item)) as string[];
    const remain = registeredEntitiesKeys.filter((item) => !predefinedTabs.includes(item));
    const tabsOrder = [...predefinedTabs, ...remain];
    return tabsOrder
      .filter((key) => !!entitiesData[key])
      .map((key) => {
        const info = this._entityTablesRegistry.getItemInfo(key);
        return {
          id: key,
          label: info?.label ?? key,
        } as Tab<string>;
      });
  }
}
