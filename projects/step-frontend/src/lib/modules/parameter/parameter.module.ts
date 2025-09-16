import { inject, NgModule } from '@angular/core';
import {
  AugmentedParametersService,
  checkEntityGuardFactory,
  CommonEntitiesUrlsService,
  CustomCellRegistryService,
  dialogRoute,
  EntityRegistry,
  ExportDialogComponent,
  ImportDialogComponent,
  MultipleProjectsService,
  SimpleOutletComponent,
  ViewRegistryService,
} from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { ParameterScopeComponent } from './components/parameter-scope/parameter-scope.component';
import './components/parameter-selection/parameter-selection.component';
import { ParameterSelectionComponent } from './components/parameter-selection/parameter-selection.component';
import { ParametersKeyComponent } from './components/parameters-key/parameters-key.component';
import { ParameterListComponent } from './components/parameter-list/parameter-list.component';
import { ParameterLastModificationComponent } from './components/parameter-last-modification/parameter-last-modification.component';
import { ParameterEditDialogComponent } from './components/parameter-edit-dialog/parameter-edit-dialog.component';
import { ParametersBulkOperationsRegisterService } from './services/parameters-bulk-operations-register.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { ParameterUrlPipe } from './pipes/parameter-url.pipe';
import { ParameterConditionDialogComponent } from './components/parameter-condition-dialog/parameter-condition-dialog.component';
import { InputTypePipe } from './pipes/input-type.pipe';
import { InputOptionsPipe } from './pipes/input-options.pipe';

@NgModule({
  imports: [StepCommonModule],
  exports: [ParameterListComponent, ParameterSelectionComponent, ParametersKeyComponent, ParameterScopeComponent],
  declarations: [
    ParameterListComponent,
    ParametersKeyComponent,
    ParameterScopeComponent,
    ParameterSelectionComponent,
    ParameterLastModificationComponent,
    ParameterEditDialogComponent,
    ParameterUrlPipe,
    ParameterConditionDialogComponent,
    InputTypePipe,
    InputOptionsPipe,
  ],
})
export class ParameterModule {
  constructor(
    _entityRegistry: EntityRegistry,
    _cellRegister: CustomCellRegistryService,
    _parametersRegister: ParametersBulkOperationsRegisterService,
    _vewRegistry: ViewRegistryService,
  ) {
    _entityRegistry.register('parameters', 'Parameters', {
      icon: 'list',
      component: ParameterSelectionComponent,
    });
    _parametersRegister.register();

    _cellRegister.registerCell('parameterLastModification', ParameterLastModificationComponent);
    _cellRegister.registerCell('parameterKey', ParametersKeyComponent);
    _vewRegistry.registerRoute({
      path: 'parameters',
      component: ParameterListComponent,
      children: [
        {
          path: 'editor',
          component: SimpleOutletComponent,
          children: [
            dialogRoute({
              path: '',
              dialogComponent: ParameterEditDialogComponent,
              resolve: {
                entity: () => inject(AugmentedParametersService).newParameter(),
              },
              data: {
                isNew: true,
              },
            }),
            dialogRoute({
              path: ':id',
              dialogComponent: ParameterEditDialogComponent,
              canActivate: [
                checkEntityGuardFactory({
                  entityType: 'parameter',
                  getEntity: (id) => inject(AugmentedParametersService).getParameterByIdCached(id),
                  getEditorUrl: (id) => inject(CommonEntitiesUrlsService).parameterEditorUrl(id),
                  getListUrl: () => inject(CommonEntitiesUrlsService).parametersListUrl(),
                  isMatchEditorUrl: (url) => inject(CommonEntitiesUrlsService).isMatchParameterEditorUrl(url),
                }),
              ],
              resolve: {
                entity: (route: ActivatedRouteSnapshot) =>
                  inject(AugmentedParametersService).getParameterByIdCached(route.params['id']),
              },
              data: {
                isNew: false,
              },
              canDeactivate: [
                () => {
                  inject(AugmentedParametersService).cleanupCache();
                  inject(MultipleProjectsService).cleanupProjectMessage();
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
            title: 'Parameters import',
            entity: 'parameters',
            overwrite: false,
            importAll: false,
          },
        }),
        dialogRoute({
          path: 'export',
          dialogComponent: ExportDialogComponent,
          data: {
            title: 'Parameters export',
            entity: 'parameters',
            filename: 'allParameters.sta',
          },
        }),
      ],
    });
  }
}
