import { NgModule } from '@angular/core';
import {
  CustomCellRegistryService,
  CustomSearchCellRegistryService,
  EntityRegistry,
  FunctionLinkComponent,
  FunctionLinkDialogService,
  FunctionTypeRegistryService,
  StepBasicsModule,
  StepCoreModule,
  ViewRegistryService,
} from '@exense/step-core';
import { PlanEditorModule } from '../plan-editor/plan-editor.module';
import { StepCommonModule } from '../_common/step-common.module';
import { AgentTokenSelectionCriteriaComponent } from './components/agent-token-selection-criteria/agent-token-selection-criteria.component';
import { CompositeFunctionEditorComponent } from './components/composite-function-editor/composite-function-editor.component';
import { FunctionConfigurationDialogComponent } from './components/function-configuration-dialog/function-configuration-dialog.component';
import { FunctionIconComponent } from './components/function-icon/function-icon.component';
import { FunctionListComponent } from './components/function-list/function-list.component';
import { FunctionPackageConfigurationDialogComponent } from './components/function-package-configuration-dialog/function-package-configuration-dialog.component';
import { FunctionPackageLinkComponent } from './components/function-package-link/function-package-link.component';
import { FunctionPackageListComponent } from './components/function-package-list/function-package-list.component';
import { FunctionPackageSearchComponent } from './components/function-package-search/function-package-search.component';
import './components/function-package-selection/function-package-selection.component';
import { FunctionPackageSelectionComponent } from './components/function-package-selection/function-package-selection.component';
import { FunctionTypeAstraComponent } from './components/function-type-astra/function-type-astra.component';
import { FunctionTypeCompositeComponent } from './components/function-type-composite/function-type-composite.component';
import { FunctionTypeCucumberComponent } from './components/function-type-cucumber/function-type-cucumber.component';
import { FunctionTypeCypressComponent } from './components/function-type-cypress/function-type-cypress.component';
import { FunctionTypeDotnetComponent } from './components/function-type-dotnet/function-type-dotnet.component';
import { FunctionTypeFilterComponent } from './components/function-type-filter/function-type-filter.component';
import { FunctionTypeImageCompareComponent } from './components/function-type-image-compare/function-type-image-compare.component';
import { FunctionTypeJMeterComponent } from './components/function-type-jmeter/function-type-jmeter.component';
import { FunctionTypeNodeJSComponent } from './components/function-type-node-js/function-type-node-js.component';
import { FunctionTypeOryonComponent } from './components/function-type-oryon/function-type-oryon.component';
import { FunctionTypePDFTestComponent } from './components/function-type-pdf-test/function-type-pdf-test.component';
import { FunctionTypeQFTestComponent } from './components/function-type-qf-test/function-type-qf-test.component';
import { FunctionTypeScriptComponent } from './components/function-type-script/function-type-script.component';
import { FunctionTypeSikulixComponent } from './components/function-type-sikulix/function-type-sikulix.component';
import { FunctionTypeSoapUIComponent } from './components/function-type-soap-ui/function-type-soap-ui.component';
import { FunctionTypeFormPipe } from './pipes/function-type-form.pipe';
import { FunctionTypeLabelPipe } from './pipes/function-type-label.pipe';
import { FunctionDialogsService } from './services/function-dialogs.service';
import { FunctionType } from './types/function-type.enum';

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
    FunctionConfigurationDialogComponent,
    AgentTokenSelectionCriteriaComponent,
    FunctionTypeFormPipe,
    FunctionTypeCompositeComponent,
    FunctionTypeQFTestComponent,
    FunctionTypeScriptComponent,
    FunctionTypeDotnetComponent,
    FunctionTypeAstraComponent,
    FunctionTypeJMeterComponent,
    FunctionTypeCypressComponent,
    FunctionTypeOryonComponent,
    FunctionTypeSoapUIComponent,
    FunctionTypeNodeJSComponent,
    FunctionTypePDFTestComponent,
    FunctionTypeImageCompareComponent,
    FunctionTypeCucumberComponent,
    FunctionTypeSikulixComponent,
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
      templateUrl: '/partials/functions/functionSelectionTable.html',
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
    this._cellsRegistry.registerCell('functionEntityIcon', FunctionIconComponent);
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
    this._functionTypeRegistryService.register(FunctionType.QF_TEST, 'QF-Test', FunctionTypeQFTestComponent);
    this._functionTypeRegistryService.register(
      FunctionType.SCRIPT,
      'Script (Java, JS, Groovy, etc)',
      FunctionTypeScriptComponent
    );
    this._functionTypeRegistryService.register(FunctionType.DOTNET, '.NET', FunctionTypeDotnetComponent);
    this._functionTypeRegistryService.register(FunctionType.ASTRA, 'Astra', FunctionTypeAstraComponent);
    this._functionTypeRegistryService.register(FunctionType.JMETER, 'JMeter', FunctionTypeJMeterComponent);
    this._functionTypeRegistryService.register(FunctionType.CYPRESS, 'Cypress', FunctionTypeCypressComponent);
    this._functionTypeRegistryService.register(FunctionType.ORYON, 'Oryon', FunctionTypeOryonComponent);
    this._functionTypeRegistryService.register(FunctionType.SOAP_UI, 'SoapUI', FunctionTypeSoapUIComponent);
    this._functionTypeRegistryService.register(FunctionType.NODE_JS, 'Node.js', FunctionTypeNodeJSComponent);
    this._functionTypeRegistryService.register(FunctionType.PDF_TEST, 'PDF Test', FunctionTypePDFTestComponent);
    this._functionTypeRegistryService.register(
      FunctionType.IMAGE_COMPARE,
      'Image Compare',
      FunctionTypeImageCompareComponent
    );
    this._functionTypeRegistryService.register(FunctionType.CUCUMBER, 'Cucumber', FunctionTypeCucumberComponent);
    this._functionTypeRegistryService.register(FunctionType.SIKULIX, 'SikuliX', FunctionTypeSikulixComponent);
  }
}
