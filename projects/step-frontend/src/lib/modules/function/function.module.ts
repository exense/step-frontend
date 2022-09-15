import { NgModule } from '@angular/core';
import { CustomCellRegistryService, EntityRegistry, StepBasicsModule, StepCoreModule } from '@exense/step-core';
import { FunctionListComponent } from './components/function-list/function-list.component';
import { StepCommonModule } from '../_common/step-common.module';
import { FunctionPackageLinkComponent } from './components/function-package-link/function-package-link.component';
import { FunctionPackageListComponent } from './components/function-package-list/function-package-list.component';
import { FunctionIconComponent } from './components/function-icon/function-icon.component';
import { FunctionLinkComponent } from './components/function-link/function-link.component';

@NgModule({
  declarations: [
    FunctionListComponent,
    FunctionPackageLinkComponent,
    FunctionPackageListComponent,
    FunctionIconComponent,
    FunctionLinkComponent,
  ],
  imports: [StepCommonModule, StepCoreModule, StepBasicsModule],
  exports: [FunctionListComponent],
})
export class FunctionModule {
  constructor(_entityRegistry: EntityRegistry, _cellsRegistry: CustomCellRegistryService) {
    _entityRegistry.register('functions', 'Keyword', 'target');
    _cellsRegistry.registerCell('functionEntityIcon', FunctionIconComponent);
    _cellsRegistry.registerCell('functionLink', FunctionLinkComponent);
    _cellsRegistry.registerCell('functionPackageLink', FunctionPackageLinkComponent);
  }
}
