import { NgModule } from '@angular/core';
import { FunctionType, FunctionTypeRegistryService, StepCoreModule } from '@exense/step-core';
import { FunctionTypeNodeJSComponent } from './components/function-type-node-js/function-type-node-js.component';

@NgModule({
  declarations: [FunctionTypeNodeJSComponent],
  imports: [StepCoreModule],
})
export class NodePluginModule {
  constructor(private _functionTypeRegistryService: FunctionTypeRegistryService) {
    this.registerFunctionTypes();
  }

  private registerFunctionTypes(): void {
    this._functionTypeRegistryService.register(FunctionType.NODE_JS, 'Node.js', FunctionTypeNodeJSComponent);
  }
}
