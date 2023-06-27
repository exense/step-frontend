import { NgModule } from '@angular/core';
import {
  CustomCellRegistryService,
  CustomSearchCellRegistryService,
  EntityRegistry,
  FunctionLinkComponent,
  FunctionLinkDialogService,
  FunctionType,
  FunctionTypeRegistryService,
  StepBasicsModule,
  StepCoreModule,
  ViewRegistryService,
} from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanEditorModule } from '../plan-editor/plan-editor.module';
import { CompositeFunctionEditorComponent } from './components/composite-function-editor/composite-function-editor.component';
import { FunctionConfigurationDialogComponent } from './components/function-configuration-dialog/function-configuration-dialog.component';
import { FunctionListComponent } from './components/function-list/function-list.component';
import { FunctionPackageConfigurationDialogComponent } from './components/function-package-configuration-dialog/function-package-configuration-dialog.component';
import { FunctionPackageLinkComponent } from './components/function-package-link/function-package-link.component';
import { FunctionPackageListComponent } from './components/function-package-list/function-package-list.component';
import { FunctionPackageSearchComponent } from './components/function-package-search/function-package-search.component';
import './components/function-package-selection/function-package-selection.component';
import { FunctionPackageSelectionComponent } from './components/function-package-selection/function-package-selection.component';
import { FunctionSelectionTableComponent } from './components/function-selection-table/function-selection-table.component';
import { FunctionTypeCompositeComponent } from './components/function-type-composite/function-type-composite.component';
import { FunctionTypeFilterComponent } from './components/function-type-filter/function-type-filter.component';
import { FunctionTypeJMeterComponent } from './components/function-type-jmeter/function-type-jmeter.component';
import { FunctionTypeNodeJSComponent } from './components/function-type-node-js/function-type-node-js.component';
import { FunctionTypeScriptComponent } from './components/function-type-script/function-type-script.component';
import { FunctionTypeLabelPipe } from './pipes/function-type-label.pipe';
import './services/function-dialogs.service';
import { FunctionDialogsService } from './services/function-dialogs.service';

@NgModule({
  imports: [StepCommonModule, StepCoreModule, StepBasicsModule, PlanEditorModule],
  declarations: [
    FunctionListComponent,
    FunctionPackageLinkComponent,
    FunctionPackageListComponent,
    FunctionTypeLabelPipe,
    FunctionTypeFilterComponent,
    FunctionPackageSearchComponent,
    FunctionPackageSelectionComponent,
    CompositeFunctionEditorComponent,
    FunctionPackageConfigurationDialogComponent,
    FunctionConfigurationDialogComponent,
    FunctionSelectionTableComponent,
    FunctionTypeCompositeComponent,
    FunctionTypeScriptComponent,
    FunctionTypeJMeterComponent,
    FunctionTypeNodeJSComponent,
  ],
  providers: [
    {
      provide: FunctionLinkDialogService,
      useExisting: FunctionDialogsService,
    },
  ],
  exports: [
    FunctionListComponent,
    FunctionPackageSelectionComponent,
    CompositeFunctionEditorComponent,
    FunctionPackageConfigurationDialogComponent,
    FunctionConfigurationDialogComponent,
    FunctionSelectionTableComponent,
  ],
})
export class FunctionModule {
  constructor(
    private _entityRegistry: EntityRegistry,
    private _cellsRegistry: CustomCellRegistryService,
    private _viewRegistry: ViewRegistryService,
    private _searchCellsRegistry: CustomSearchCellRegistryService,
    private _functionTypeRegistryService: FunctionTypeRegistryService
  ) {
    this.registerEntities();
    this.registerViews();
    this.registerCells();
    this.registerSearchCells();
    this.registerFunctionTypes();
  }

  private registerEntities(): void {
    this._entityRegistry.register('functions', 'Keyword', {
      icon: 'target',
      component: FunctionSelectionTableComponent,
    });
    this._entityRegistry.registerEntity(
      'KeywordPackage',
      'functionPackage',
      'gift',
      'functionPackage',
      'rest/functionpackages/',
      'rest/functionpackages/',
      'st-table',
      FunctionPackageSelectionComponent
    );
  }

  private registerViews(): void {
    this._viewRegistry.registerView('functions', 'partials/functionList.html');
    this._viewRegistry.registerView('composites', 'partials/functions/compositeKeywordEditor.html');
  }

  private registerCells(): void {
    this._cellsRegistry.registerCell('functionLink', FunctionLinkComponent);
    this._cellsRegistry.registerCell('functionPackageLink', FunctionPackageLinkComponent);
  }

  private registerSearchCells(): void {
    this._searchCellsRegistry.registerSearchCell(
      'rest/table/functionPackage/searchIdsBy/attributes.name',
      FunctionPackageSearchComponent
    );
  }

  private registerFunctionTypes(): void {
    this._functionTypeRegistryService.register(FunctionType.COMPOSITE, 'Composite', FunctionTypeCompositeComponent);
    this._functionTypeRegistryService.register(
      FunctionType.SCRIPT,
      'Script (Java, JS, Groovy, etc)',
      FunctionTypeScriptComponent
    );
    this._functionTypeRegistryService.register(FunctionType.J_METER, 'JMeter', FunctionTypeJMeterComponent);
    this._functionTypeRegistryService.register(FunctionType.NODE_JS, 'Node.js', FunctionTypeNodeJSComponent);
  }
}
