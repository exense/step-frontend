import { inject, NgModule } from '@angular/core';
import {
  AugmentedKeywordPackagesService,
  checkEntityGuardFactory,
  CustomCellRegistryService,
  CustomSearchCellRegistryService,
  DashletRegistryService,
  dialogRoute,
  EntityRegistry,
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
import { UploadPackageBtnComponent } from './components/upload-package-btn/upload-package-btn.component';
import { ActivatedRouteSnapshot } from '@angular/router';
import { PackageUrlPipe } from './pipes/package-url.pipe';

@NgModule({
  declarations: [
    FunctionPackageConfigurationDialogComponent,
    FunctionPackageLinkComponent,
    FunctionPackageListComponent,
    FunctionPackageSearchComponent,
    FunctionPackageSelectionComponent,
    UploadPackageBtnComponent,
    PackageUrlPipe,
  ],
  imports: [StepCoreModule],
  exports: [
    FunctionPackageConfigurationDialogComponent,
    FunctionPackageLinkComponent,
    FunctionPackageListComponent,
    FunctionPackageSearchComponent,
    FunctionPackageSelectionComponent,
    UploadPackageBtnComponent,
  ],
})
export class FunctionPackagesModule {
  constructor(
    private _entityRegistry: EntityRegistry,
    private _cellsRegistry: CustomCellRegistryService,
    private _viewRegistry: ViewRegistryService,
    private _searchCellsRegistry: CustomSearchCellRegistryService,
    private _dashletsRegistry: DashletRegistryService,
  ) {
    this.registerEntities();
    this.registerViews();
    this.registerCells();
    this.registerSearchCells();
    this.registerMenuItems();
    this.registerDashlets();
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
    this._viewRegistry.registerRoute({
      path: 'function-packages',
      component: FunctionPackageListComponent,
      children: [
        {
          path: 'editor',
          component: SimpleOutletComponent,
          children: [
            dialogRoute({
              path: 'new',
              dialogComponent: FunctionPackageConfigurationDialogComponent,
            }),
            dialogRoute({
              path: ':id',
              dialogComponent: FunctionPackageConfigurationDialogComponent,
              canActivate: [
                checkEntityGuardFactory({
                  entityType: 'keyword package',
                  getEntity: (id) => inject(AugmentedKeywordPackagesService).getFunctionPackageCached(id),
                  getEditorUrl: (id) => `/function-packages/editor/${id}`,
                }),
              ],
              resolve: {
                functionPackage: (route: ActivatedRouteSnapshot) => {
                  return inject(AugmentedKeywordPackagesService).getFunctionPackageCached(route.params['id']);
                },
              },
              canDeactivate: [
                () => {
                  inject(AugmentedKeywordPackagesService).cleanupCache();
                  return true;
                },
              ],
            }),
          ],
        },
      ],
    });
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

  private registerDashlets(): void {
    this._dashletsRegistry.registerDashlet('uploadPackageBtn', UploadPackageBtnComponent);
  }
}

export * from './components/function-package-configuration-dialog/function-package-configuration-dialog.component';
export * from './components/function-package-link/function-package-link.component';
export * from './components/function-package-list/function-package-list.component';
export * from './components/function-package-search/function-package-search.component';
export * from './components/function-package-selection/function-package-selection.component';
export * from './components/upload-package-btn/upload-package-btn.component';
