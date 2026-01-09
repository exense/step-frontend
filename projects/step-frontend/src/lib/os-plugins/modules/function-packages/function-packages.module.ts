import { inject, NgModule } from '@angular/core';
import {
  AugmentedKeywordPackagesService,
  checkEntityGuardFactory,
  CheckProjectGuardConfig,
  CustomCellRegistryService,
  CustomSearchCellRegistryService,
  dialogRoute,
  EntityRefDirective,
  EntityRegistry,
  MultipleProjectsService,
  QuickAccessRouteService,
  SimpleOutletComponent,
  StepCoreModule,
  ViewRegistryService,
} from '@exense/step-core';
import { FunctionPackageConfigurationDialogComponent } from './components/function-package-configuration-dialog/function-package-configuration-dialog.component';
import { FunctionPackageListComponent } from './components/function-package-list/function-package-list.component';
import { FunctionPackageSearchComponent } from './components/function-package-search/function-package-search.component';
import { FunctionPackageLinkComponent } from './components/function-package-link/function-package-link.component';
import { FunctionPackageSelectionComponent } from './components/function-package-selection/function-package-selection.component';

import './components/function-package-selection/function-package-selection.component';
import { ActivatedRouteSnapshot, Route } from '@angular/router';
import { PackageUrlPipe } from './pipes/package-url.pipe';

@NgModule({
  declarations: [
    FunctionPackageConfigurationDialogComponent,
    FunctionPackageLinkComponent,
    FunctionPackageListComponent,
    FunctionPackageSearchComponent,
    FunctionPackageSelectionComponent,
    PackageUrlPipe,
  ],
  imports: [StepCoreModule, EntityRefDirective],
  exports: [
    FunctionPackageConfigurationDialogComponent,
    FunctionPackageLinkComponent,
    FunctionPackageListComponent,
    FunctionPackageSearchComponent,
    FunctionPackageSelectionComponent,
  ],
})
export class FunctionPackagesModule {
  constructor(
    private _entityRegistry: EntityRegistry,
    private _cellsRegistry: CustomCellRegistryService,
    private _viewRegistry: ViewRegistryService,
    private _quickAccessRoutes: QuickAccessRouteService,
    private _searchCellsRegistry: CustomSearchCellRegistryService,
  ) {
    this.registerEntities();
    this.registerViews();
    this.registerCells();
    this.registerSearchCells();
    this.registerMenuItems();
  }

  private registerEntities(): void {
    this._entityRegistry.registerEntity(
      'KeywordPackage',
      'functionPackage',
      'package',
      'functionPackage',
      'rest/functionpackages/',
      'rest/functionpackages/',
      'st-table',
      FunctionPackageSelectionComponent,
    );
  }

  private registerViews(): void {
    const functionPackageEditor = (
      mainPath: string,
      projectGuardConfig: CheckProjectGuardConfig /* editorUrl: string*/,
    ): Route => ({
      path: mainPath,
      component: SimpleOutletComponent,
      children: [
        dialogRoute({
          path: 'new',
          dialogComponent: FunctionPackageConfigurationDialogComponent,
        }),
        dialogRoute({
          path: ':id',
          dialogComponent: FunctionPackageConfigurationDialogComponent,
          canActivate: [checkEntityGuardFactory(projectGuardConfig)],
          resolve: {
            functionPackage: (route: ActivatedRouteSnapshot) => {
              return inject(AugmentedKeywordPackagesService).getFunctionPackageCached(route.params['id']);
            },
          },
          canDeactivate: [
            () => {
              inject(MultipleProjectsService).cleanupProjectMessage();
              inject(AugmentedKeywordPackagesService).cleanupCache();
              return true;
            },
          ],
        }),
      ],
    });

    this._viewRegistry.registerRoute({
      path: 'function-packages',
      component: FunctionPackageListComponent,
      children: [
        functionPackageEditor('editor', {
          entityType: 'keyword package',
          getEntity: (id) => inject(AugmentedKeywordPackagesService).getFunctionPackageCached(id),
          getEditorUrl: (id) => `/function-packages/editor/${id}`,
          getListUrl: () => '/function-packages',
          isMatchEditorUrl: (url) => url.includes('/function-packages/editor'),
        }),
      ],
    });

    const keywordsRoute = this._quickAccessRoutes.getRoute('keywords');
    keywordsRoute?.children?.push?.(
      functionPackageEditor('function-package-editor', {
        entityType: 'keyword package',
        getEntity: (id) => inject(AugmentedKeywordPackagesService).getFunctionPackageCached(id),
        getEditorUrl: (id) => `/functions/function-package-editor/${id}`,
        getListUrl: () => '/functions',
        isMatchEditorUrl: (url) => url.includes('/functions/function-package-editor'),
      }),
    );
  }

  private registerCells(): void {
    this._cellsRegistry.registerCell('functionPackageLink', FunctionPackageLinkComponent);
  }

  private registerSearchCells(): void {
    this._searchCellsRegistry.registerSearchCell(
      'rest/table/functionPackage/searchIdsBy/attributes.name',
      FunctionPackageSearchComponent,
    );
  }

  private registerMenuItems(): void {
    this._viewRegistry.registerMenuEntry('Keyword Packages', 'function-packages', 'package', {
      weight: 20,
      parentId: 'automation-root',
    });
  }
}

export * from './components/function-package-configuration-dialog/function-package-configuration-dialog.component';
export * from './components/function-package-link/function-package-link.component';
export * from './components/function-package-list/function-package-list.component';
export * from './components/function-package-search/function-package-search.component';
export * from './components/function-package-selection/function-package-selection.component';
