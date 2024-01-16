import { inject, NgModule } from '@angular/core';
import {
  CustomCellRegistryService,
  FunctionLinkComponent,
  FunctionType,
  FunctionTypeRegistryService,
  StepBasicsModule,
  StepCoreModule,
  ViewRegistryService,
  FunctionConfigurationService,
  SimpleOutletComponent,
  FunctionPackageTypeRegistryService,
  PlansService,
  AugmentedKeywordsService,
  Plan,
} from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanEditorModule } from '../plan-editor/plan-editor.module';
import { CompositeFunctionEditorComponent } from './components/composite-function-editor/composite-function-editor.component';
import { FunctionConfigurationDialogComponent } from './components/function-configuration-dialog/function-configuration-dialog.component';
import { FunctionListComponent } from './components/function-list/function-list.component';
import { FunctionTypeCompositeComponent } from './components/function-type-composite/function-type-composite.component';
import { FunctionTypeFilterComponent } from './components/function-type-filter/function-type-filter.component';
import { FunctionConfigurationImplService } from './services/function-configuration-impl.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { CompositeKeywordPlanApiService } from './services/composite-keyword-plan-api.service';

@NgModule({
  imports: [StepCommonModule, StepCoreModule, StepBasicsModule, PlanEditorModule],
  declarations: [
    FunctionListComponent,
    FunctionTypeFilterComponent,
    CompositeFunctionEditorComponent,
    FunctionConfigurationDialogComponent,
    FunctionTypeCompositeComponent,
  ],
  providers: [
    {
      provide: FunctionConfigurationService,
      useExisting: FunctionConfigurationImplService,
    },
  ],
  exports: [FunctionListComponent, CompositeFunctionEditorComponent, FunctionConfigurationDialogComponent],
})
export class FunctionModule {
  constructor(
    private _cellsRegistry: CustomCellRegistryService,
    private _viewRegistry: ViewRegistryService,
    private _functionTypeRegistryService: FunctionTypeRegistryService,
    private _functionPackageTypeRegistryService: FunctionPackageTypeRegistryService
  ) {
    this.registerViews();
    this.registerCells();
    this.registerFunctionTypes();
    this.registerFunctionPackageTypes();
  }

  private registerViews(): void {
    this._viewRegistry.registerRoute({
      path: 'functions',
      component: FunctionListComponent,
    });
    this._viewRegistry.registerRoute({
      path: 'composites',
      component: SimpleOutletComponent,
      children: [
        {
          path: 'editor/:id',
          component: CompositeFunctionEditorComponent,
          resolve: {
            compositePlan: (route: ActivatedRouteSnapshot) => {
              const id = route.params['id'];
              return id ? inject(CompositeKeywordPlanApiService).loadPlan(id) : undefined;
            },
          },
        },
      ],
    });
  }

  private registerCells(): void {
    this._cellsRegistry.registerCell('functionLink', FunctionLinkComponent);
  }

  private registerFunctionTypes(): void {
    this._functionTypeRegistryService.register(FunctionType.COMPOSITE, 'Composite', FunctionTypeCompositeComponent);
  }

  private registerFunctionPackageTypes(): void {
    this._functionPackageTypeRegistryService.register('java', 'Java Jar');
    this._functionPackageTypeRegistryService.register('dotnet', '.NET DLL');
  }
}
