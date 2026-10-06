import {
  AdditionalRightRuleService,
  DashletRegistryService,
  IDE_MODE,
  IdeStateStrategyService,
  MenuItemsOverrideConfigService,
  StepCoreModule,
  ViewRegistryService,
  SimpleOutletComponent,
} from '@exense/step-core';
import { inject, NgModule } from '@angular/core';
import { of } from 'rxjs';
import { IDE_MENU_ITEMS } from './shared/ide-menu-items';
import { IDE_HOME_ROUTE } from './shared/ide-home-route';
import { IdeHeaderBarComponent } from './components/ide-header-bar/ide-header-bar.component';
import { IdeEmptyStateComponent } from './components/ide-empty-state/ide-empty-state.component';
import { IdeStateService } from './services/ide-state.service';
import { IdeRemoteDefaultsService } from '../ide-remote/services/ide-remote-defaults.service';
import { IdeRemoteHeaderComponent } from '../ide-remote/components/ide-remote-header/ide-remote-header.component';
import { IdeExecutionTargetToggleComponent } from '../ide-remote/components/ide-execution-target-toggle/ide-execution-target-toggle.component';
import { IdeRemoteExecutionPanelComponent } from '../ide-remote/components/ide-remote-execution-panel/ide-remote-execution-panel.component';

@NgModule({
  imports: [
    StepCoreModule,
    IdeHeaderBarComponent,
    IdeEmptyStateComponent,
    IdeRemoteHeaderComponent,
    IdeExecutionTargetToggleComponent,
    IdeRemoteExecutionPanelComponent,
  ],
})
export class IdeModeModule {
  private _isIdeMode = inject(IDE_MODE);
  private _menuItemsOverride = inject(MenuItemsOverrideConfigService);
  private _dashletRegistry = inject(DashletRegistryService);
  private _viewRegistry = inject(ViewRegistryService);
  private _ideState = inject(IdeStateService);
  private _ideStateStrategy = inject(IdeStateStrategyService);
  private _additionalRightRules = inject(AdditionalRightRuleService);
  private _remoteDefaults = inject(IdeRemoteDefaultsService);

  constructor() {
    if (this._isIdeMode) {
      this._viewRegistry.registerRoute({ path: IDE_HOME_ROUTE, component: SimpleOutletComponent });
      this.setupMenuItems();
      this.registerDashlets();
      this.registerRule();
      this.initializeState();
      this._remoteDefaults.initialize();
    }
  }

  private setupMenuItems(): void {
    this._menuItemsOverride.configure(of(IDE_MENU_ITEMS));
  }

  private registerDashlets(): void {
    this._dashletRegistry.registerDashlet('IdeHeaderBar', IdeHeaderBarComponent);
    this._viewRegistry.registerDashlet('ide/bar', '', 'IdeHeaderBar', 'IdeHeaderBar');
    this._dashletRegistry.registerDashlet('IdeEmptyState', IdeEmptyStateComponent);
    this._viewRegistry.registerDashlet('ide/empty', '', 'IdeEmptyState', 'IdeEmptyState');
    this._dashletRegistry.registerDashlet('IdeRemoteHeader', IdeRemoteHeaderComponent);
    this._viewRegistry.registerDashlet('ide/bar/remote', '', 'IdeRemoteHeader', 'IdeRemoteHeader');
    this._dashletRegistry.registerDashlet('IdeExecutionTargetToggle', IdeExecutionTargetToggleComponent);
    this._viewRegistry.registerDashlet(
      'execution/launch/header',
      '',
      'IdeExecutionTargetToggle',
      'IdeExecutionTargetToggle',
    );
    this._dashletRegistry.registerDashlet('IdeRemoteExecutionPanel', IdeRemoteExecutionPanelComponent);
    this._viewRegistry.registerDashlet(
      'execution/launch/body',
      '',
      'IdeRemoteExecutionPanel',
      'IdeRemoteExecutionPanel',
    );
  }

  private registerRule(): void {
    this._additionalRightRules.registerRule((right: string, isIgnoreEntity?: boolean) => {
      if (this._ideState.hasPackage) {
        return true;
      }

      return !(right.endsWith('-write') || right.endsWith('-delete') || right.endsWith('-execute'));
    });
  }

  private initializeState(): void {
    this._ideStateStrategy.useStrategy(this._ideState);
    this._ideState.initialize();
  }
}
