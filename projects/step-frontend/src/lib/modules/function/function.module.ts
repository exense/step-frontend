import { inject, NgModule } from '@angular/core';
import {
  CustomCellRegistryService,
  FunctionLinkComponent,
  FunctionType,
  FunctionTypeRegistryService,
  StepBasicsModule,
  StepCoreModule,
  ViewRegistryService,
  SimpleOutletComponent,
  FunctionPackageTypeRegistryService,
  FunctionLinkEditorComponent,
  dialogRoute,
  FunctionDialogsConfigFactoryService,
  AugmentedKeywordsService,
  ImportDialogComponent,
  ExportDialogComponent,
  FunctionConfigurationDialogResolver,
  checkEntityGuardFactory,
  CommonEntitiesUrlsService,
  NavigatorService,
  preloadScreenDataResolver,
  stepRouteAdditionalConfig,
} from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanEditorModule } from '../plan-editor/plan-editor.module';
import { CompositeFunctionEditorComponent } from './components/composite-function-editor/composite-function-editor.component';
import { FunctionConfigurationDialogComponent } from './components/function-configuration-dialog/function-configuration-dialog.component';
import { FunctionListComponent } from './components/function-list/function-list.component';
import { FunctionTypeCompositeComponent } from './components/function-type-composite/function-type-composite.component';
import { ActivatedRouteSnapshot } from '@angular/router';
import { CompositeKeywordPlanContextApiService } from './injectables/composite-keyword-plan-context-api.service';
import { map } from 'rxjs';
import { FunctionConfigurationDialogImplResolver } from './injectables/function-configuration-dialog-impl.resolver';

@NgModule({
  imports: [StepCommonModule, StepCoreModule, StepBasicsModule, PlanEditorModule],
  declarations: [
    FunctionListComponent,
    CompositeFunctionEditorComponent,
    FunctionConfigurationDialogComponent,
    FunctionTypeCompositeComponent,
  ],
  providers: [
    {
      provide: FunctionConfigurationDialogResolver,
      useExisting: FunctionConfigurationDialogImplResolver,
    },
  ],
  exports: [FunctionListComponent, CompositeFunctionEditorComponent, FunctionConfigurationDialogComponent],
})
export class FunctionModule {
  constructor(
    private _cellsRegistry: CustomCellRegistryService,
    private _viewRegistry: ViewRegistryService,
    private _functionTypeRegistryService: FunctionTypeRegistryService,
    private _functionPackageTypeRegistryService: FunctionPackageTypeRegistryService,
  ) {
    this.registerViews();
    this.registerCells();
    this.registerFunctionTypes();
    this.registerFunctionPackageTypes();
  }

  private registerViews(): void {
    this._viewRegistry.registerRoute(
      stepRouteAdditionalConfig(
        { quickAccessAlias: 'keywords' },
        {
          path: 'functions',
          resolve: {
            keywordScreenData: preloadScreenDataResolver('keyword'),
          },
          component: FunctionListComponent,
          children: [
            {
              path: 'configure',
              component: SimpleOutletComponent,
              children: [
                dialogRoute({
                  path: 'new',
                  resolveDialogComponent: () => inject(FunctionConfigurationDialogResolver).getDialogComponent(),
                  resolve: {
                    dialogConfig: () => inject(FunctionDialogsConfigFactoryService).getDefaultConfig(),
                  },
                }),
                dialogRoute({
                  path: ':id',
                  resolveDialogComponent: () => inject(FunctionConfigurationDialogResolver).getDialogComponent(),
                  canActivate: [
                    checkEntityGuardFactory({
                      entityType: 'keyword',
                      getEntity: (id) => inject(AugmentedKeywordsService).getFunctionByIdCached(id),
                      getEditorUrl: (id) => inject(CommonEntitiesUrlsService).keywordConfigurerUrl(id),
                    }),
                  ],
                  resolve: {
                    keyword: (route: ActivatedRouteSnapshot) => {
                      const id = route.params['id'];
                      if (!id) return undefined;
                      return inject(AugmentedKeywordsService).getFunctionByIdCached(id);
                    },
                    dialogConfig: () => inject(FunctionDialogsConfigFactoryService).getDefaultConfig(),
                  },
                  canDeactivate: [
                    () => {
                      inject(AugmentedKeywordsService).cleanupCache();
                      return true;
                    },
                  ],
                }),
              ],
            },
            dialogRoute({
              path: 'import',
              dialogComponent: ImportDialogComponent,
              data: {
                title: 'Keywords import',
                entity: 'functions',
                override: false,
                importAll: false,
              },
            }),
            {
              path: 'export',
              component: SimpleOutletComponent,
              children: [
                dialogRoute({
                  path: 'all',
                  dialogComponent: ExportDialogComponent,
                  data: {
                    title: 'Keywords export',
                    entity: 'functions',
                    filename: 'allKeywords.sta',
                  },
                }),
                dialogRoute({
                  path: ':id',
                  dialogComponent: ExportDialogComponent,
                  resolve: {
                    id: (route: ActivatedRouteSnapshot) => route.params['id'],
                    filename: (route: ActivatedRouteSnapshot) => {
                      const api = inject(AugmentedKeywordsService);
                      const id = route.params['id'];
                      return api.getFunctionById(id).pipe(
                        map((keyword) => keyword.attributes!['name']),
                        map((name) => `${name}.sta`),
                      );
                    },
                  },
                  data: {
                    title: 'Keywords export',
                    entity: 'functions',
                  },
                }),
              ],
            },
          ],
        },
      ),
    );
    this._viewRegistry.registerRoute({
      path: 'composites',
      resolve: {
        keywordScreenData: preloadScreenDataResolver('keyword'),
        executionParametersScreenData: preloadScreenDataResolver('executionParameters'),
        activatedViewId: () => inject(NavigatorService).forceActivateView('functions'),
      },
      component: SimpleOutletComponent,
      canDeactivate: [() => inject(NavigatorService).cleanupActivateView()],
      children: [
        {
          path: 'editor/:id',
          component: CompositeFunctionEditorComponent,
          canActivate: [
            checkEntityGuardFactory({
              entityType: 'keyword',
              getEntity: (id) => inject(AugmentedKeywordsService).getFunctionByIdCached(id),
              getEditorUrl: (id) => `/composites/editor/${id}`,
            }),
          ],
          resolve: {
            compositePlan: (route: ActivatedRouteSnapshot) => {
              const id = route.params['id'];
              return id ? inject(CompositeKeywordPlanContextApiService).loadPlan(id) : undefined;
            },
          },
          canDeactivate: [
            () => {
              inject(AugmentedKeywordsService).cleanupCache();
              return true;
            },
          ],
        },
      ],
    });
  }

  private registerCells(): void {
    this._cellsRegistry.registerCell('functionLink', FunctionLinkComponent);
    this._cellsRegistry.registerCell('functionLinkEditor', FunctionLinkEditorComponent);
  }

  private registerFunctionTypes(): void {
    this._functionTypeRegistryService.register(FunctionType.COMPOSITE, 'Composite', FunctionTypeCompositeComponent);
  }

  private registerFunctionPackageTypes(): void {
    this._functionPackageTypeRegistryService.register('java', 'Java Jar');
    this._functionPackageTypeRegistryService.register('dotnet', '.NET DLL');
  }
}
