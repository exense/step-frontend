import { NgModule } from '@angular/core';
import { CustomCellRegistryService, EntityRegistry, StepCoreModule, ViewRegistryService } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { ParameterScopeComponent } from './components/parameter-scope/parameter-scope.component';
import './components/parameter-selection/parameter-selection.component';
import { ParameterSelectionComponent } from './components/parameter-selection/parameter-selection.component';
import { ParametersKeyComponent } from './components/parameters-key/parameters-key.component';
import { ParametersListComponent } from './components/parameters-list/parameters-list.component';
import { ParameterLastModificationComponent } from './components/parameter-last-modification/parameter-last-modification.component';
import { ParameterEditDialogComponent } from './components/parameter-edit-dialog/parameter-edit-dialog.component';
import { ParametersBulkOperationsRegisterService } from './services/parameters-bulk-operations-register.service';

@NgModule({
  imports: [StepCoreModule, StepCommonModule],
  exports: [ParametersListComponent, ParameterSelectionComponent],
  declarations: [
    ParametersListComponent,
    ParametersKeyComponent,
    ParameterScopeComponent,
    ParameterSelectionComponent,
    ParameterLastModificationComponent,
    ParameterEditDialogComponent,
  ],
})
export class ParameterModule {
  constructor(
    _entityRegistry: EntityRegistry,
    _cellRegister: CustomCellRegistryService,
    _parametersRegister: ParametersBulkOperationsRegisterService,
    _vewRegistry: ViewRegistryService
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
      component: ParametersListComponent,
    });
  }
}
