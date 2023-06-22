import { NgModule } from '@angular/core';
import {
  CustomCellRegistryService,
  CustomSearchCellRegistryService,
  EntityRegistry,
  FunctionLinkComponent,
  FunctionLinkDialogService,
  StepBasicsModule,
  StepCoreModule,
  ViewRegistryService,
} from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { FunctionIconComponent } from './components/function-icon/function-icon.component';
import { FunctionListComponent } from './components/function-list/function-list.component';
import { FunctionPackageLinkComponent } from './components/function-package-link/function-package-link.component';
import { FunctionPackageListComponent } from './components/function-package-list/function-package-list.component';
import { FunctionPackageSearchComponent } from './components/function-package-search/function-package-search.component';
import './components/function-package-selection/function-package-selection.component';
import { FunctionPackageSelectionComponent } from './components/function-package-selection/function-package-selection.component';
import { FunctionTypeFilterComponent } from './components/function-type-filter/function-type-filter.component';
import { FunctionTypeLabelPipe } from './pipes/function-type-label.pipe';
import { FunctionDialogsService } from './services/function-dialogs.service';
import { PlanEditorModule } from '../plan-editor/plan-editor.module';
import { CompositeFunctionEditorComponent } from './components/composite-function-editor/composite-function-editor.component';
import { FunctionPackageConfigurationDialogComponent } from './components/function-package-configuration-dialog/function-package-configuration-dialog.component';

@NgModule({
  imports: [StepCommonModule, StepCoreModule, StepBasicsModule, PlanEditorModule],
  declarations: [
    FunctionListComponent,
    FunctionPackageLinkComponent,
    FunctionPackageListComponent,
    FunctionIconComponent,
    FunctionTypeLabelPipe,
    FunctionTypeFilterComponent,
    FunctionPackageSearchComponent,
    FunctionPackageSelectionComponent,
    CompositeFunctionEditorComponent,
    FunctionPackageConfigurationDialogComponent,
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
  ],
})
export class FunctionModule {
  constructor(
    _entityRegistry: EntityRegistry,
    _cellsRegistry: CustomCellRegistryService,
    _searchCellsRegistry: CustomSearchCellRegistryService,
    _viewRegistry: ViewRegistryService
  ) {
    _entityRegistry.register('functions', 'Keyword', {
      icon: 'target',
      templateUrl: 'partials/functions/functionSelectionTable.html',
    });
    _cellsRegistry.registerCell('functionEntityIcon', FunctionIconComponent);
    _cellsRegistry.registerCell('functionLink', FunctionLinkComponent);
    _cellsRegistry.registerCell('functionPackageLink', FunctionPackageLinkComponent);
    _searchCellsRegistry.registerSearchCell(
      'rest/table/functionPackage/searchIdsBy/attributes.name',
      FunctionPackageSearchComponent
    );
    _entityRegistry.registerEntity(
      'KeywordPackage',
      'functionPackage',
      'gift',
      'functionPackage',
      'rest/functionpackages/',
      'rest/functionpackages/',
      'st-table',
      FunctionPackageSelectionComponent
    );
    _viewRegistry.registerView('functions', 'partials/functionList.html');
    _viewRegistry.registerView('composites', 'partials/functions/compositeKeywordEditor.html');
  }
}
