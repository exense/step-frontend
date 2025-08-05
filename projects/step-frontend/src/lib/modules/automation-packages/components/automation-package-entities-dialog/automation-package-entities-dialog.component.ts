import { Component, inject, model, OnInit, ViewEncapsulation } from '@angular/core';
import { AutomationPackageEntityTableRegistryService, StepCoreModule, Tab } from '@exense/step-core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AutomationPackageEntityKey } from '../../types/automation-package-entity-key.enum';
import { AutomationPackageEntityTableComponent } from '../automation-package-entity-table/automation-package-entity-table.component';

interface AutomationPackageEntitiesDialogData {
  readonly automationPackageId: string;
}

const MAIN_TABS_ORDER = [
  AutomationPackageEntityKey.PLANS,
  AutomationPackageEntityKey.PARAMETERS,
  AutomationPackageEntityKey.KEYWORDS,
  AutomationPackageEntityKey.SCHEDULES,
];

@Component({
  selector: 'step-automation-package-entities-dialog',
  imports: [StepCoreModule, AutomationPackageEntityTableComponent],
  templateUrl: './automation-package-entities-dialog.component.html',
  styleUrl: './automation-package-entities-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AutomationPackageEntitiesDialogComponent implements OnInit {
  private _entityTablesRegistry = inject(AutomationPackageEntityTableRegistryService);
  protected readonly _automationPackageId =
    inject<AutomationPackageEntitiesDialogData>(MAT_DIALOG_DATA).automationPackageId;

  protected readonly tabs = this.createTabs();

  protected selectedTab = model<string | undefined>(undefined);

  ngOnInit(): void {
    this.selectedTab.set(this.tabs[0]?.id);
  }

  private createTabs(): Tab<string>[] {
    const registeredEntitiesKeys = this._entityTablesRegistry.getItemInfos().map((item) => item.type);
    const predefinedTabs = MAIN_TABS_ORDER.filter((item) => registeredEntitiesKeys.includes(item)) as string[];
    const remain = registeredEntitiesKeys.filter((item) => !predefinedTabs.includes(item));
    const tabsOrder = [...predefinedTabs, ...remain];
    return tabsOrder.map((key) => {
      const info = this._entityTablesRegistry.getItemInfo(key);
      return {
        id: key,
        label: info?.label ?? key,
      } as Tab<string>;
    });
  }
}
