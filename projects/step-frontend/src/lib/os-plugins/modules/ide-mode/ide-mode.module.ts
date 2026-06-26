import {
  DashletRegistryService,
  IDE_MODE,
  MenuItemsOverrideConfigService,
  StepCoreModule,
  ViewRegistryService
} from '@exense/step-core';
import {inject, NgModule} from '@angular/core';
import {of} from 'rxjs';
import {IDE_MENU_ITEMS} from './shared/ide-menu-items';
import {IdeHeaderBarComponent} from './components/ide-header-bar/ide-header-bar.component';
import {FolderPickerModalComponent} from './components/folder-picker-modal/folder-picker-modal.component';

@NgModule({
  imports: [StepCoreModule, IdeHeaderBarComponent, FolderPickerModalComponent],
})
export class IdeModeModule {
  private _isIdeMode = inject(IDE_MODE);
  private _menuItemsOverride = inject(MenuItemsOverrideConfigService);
  private _dashletRegistry = inject(DashletRegistryService);
  private _viewRegistry = inject(ViewRegistryService);

  constructor(
  ) {
    if (this._isIdeMode) {
      this.setupMenuItems();
      this.registerDashlets();
    }
  }

  private setupMenuItems(): void {
    this._menuItemsOverride.configure(of(IDE_MENU_ITEMS));
  }

  private registerDashlets(): void {
    this._dashletRegistry.registerDashlet('IdeHeaderBar', IdeHeaderBarComponent)
    this._viewRegistry.registerDashlet('ide/bar', '', 'IdeHeaderBar', 'IdeHeaderBar');
  }
}
