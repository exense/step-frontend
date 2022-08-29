import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { CustomCellRegistryService, EntityRegistryService, StepCoreModule } from '@exense/step-core';
import { ParametersListComponent } from './parameters-list/parameters-list.component';
import { ParametersIconComponent } from './parameters-icon/parameters-icon.component';
import { ParametersKeyComponent } from './parameters-key/parameters-key.component';

@NgModule({
  declarations: [ParametersListComponent, ParametersIconComponent, ParametersKeyComponent],
  exports: [ParametersListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class ParameterModule {
  constructor(_entityRegister: EntityRegistryService, _cellRegister: CustomCellRegistryService) {
    _entityRegister.register('parameters', 'Parameters', undefined, ParametersIconComponent);
    _cellRegister.registerCell('parameterEntityIcon', ParametersIconComponent);
    _cellRegister.registerCell('parameterKey', ParametersKeyComponent);
  }
}
