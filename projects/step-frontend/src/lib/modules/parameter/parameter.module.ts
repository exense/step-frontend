import { NgModule } from '@angular/core';
import { CustomCellRegistryService, EntityRegistry, StepCoreModule } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { ParameterScopeComponent } from './parameter-scope/parameter-scope.component';
import './parameter-selection/parameter-selection.component';
import { ParameterSelectionComponent } from './parameter-selection/parameter-selection.component';
import { ParametersIconComponent } from './parameters-icon/parameters-icon.component';
import { ParametersKeyComponent } from './parameters-key/parameters-key.component';
import { ParametersListComponent } from './parameters-list/parameters-list.component';

@NgModule({
  imports: [StepCoreModule, StepCommonModule],
  exports: [ParametersListComponent, ParameterSelectionComponent],
  declarations: [
    ParametersListComponent,
    ParametersIconComponent,
    ParametersKeyComponent,
    ParameterScopeComponent,
    ParameterSelectionComponent,
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
      '/partials/parameters/parameterSelectionTable.html'
    );

    _cellRegister.registerCell('parameterEntityIcon', ParametersIconComponent);
    _cellRegister.registerCell('parameterKey', ParametersKeyComponent);
  }
}
