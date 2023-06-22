import { NgModule } from '@angular/core';
import { CustomCellRegistryService, EntityRegistry, StepCoreModule } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { ParameterScopeComponent } from './components/parameter-scope/parameter-scope.component';
import './components/parameter-selection/parameter-selection.component';
import { ParameterSelectionComponent } from './components/parameter-selection/parameter-selection.component';
import { ParametersIconComponent } from './components/parameters-icon/parameters-icon.component';
import { ParametersKeyComponent } from './components/parameters-key/parameters-key.component';
import { ParametersListComponent } from './components/parameters-list/parameters-list.component';
import { ParameterLastModificationComponent } from './components/parameter-last-modification/parameter-last-modification.component';
import { ParameterEditDialogComponent } from './components/parameter-edit-dialog/parameter-edit-dialog.component';

@NgModule({
  imports: [StepCoreModule, StepCommonModule],
  exports: [ParametersListComponent, ParameterSelectionComponent],
  declarations: [
    ParametersListComponent,
    ParametersIconComponent,
    ParametersKeyComponent,
    ParameterScopeComponent,
    ParameterSelectionComponent,
    ParameterLastModificationComponent,
    ParameterEditDialogComponent,
  ],
})
export class ParameterModule {
  constructor(_entityRegistry: EntityRegistry, _cellRegister: CustomCellRegistryService) {
    _entityRegistry.registerEntity(
      'Parameters',
      'parameters',
      'list',
      'parameters',
      'rest/parameters/',
      'rest/parameters/',
      'st-table',
      'partials/parameters/parameterSelectionTable.html'
    );

    _cellRegister.registerCell('parameterLastModification', ParameterLastModificationComponent);
    _cellRegister.registerCell('parameterEntityIcon', ParametersIconComponent);
    _cellRegister.registerCell('parameterKey', ParametersKeyComponent);
  }
}
