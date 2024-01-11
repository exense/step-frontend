import { NgModule } from '@angular/core';
import { FunctionType, FunctionTypeRegistryService, StepCoreModule } from '@exense/step-core';
import { FunctionTypeJMeterComponent } from './components/function-type-jmeter/function-type-jmeter.component';

@NgModule({
  declarations: [FunctionTypeJMeterComponent],
  imports: [StepCoreModule],
})
export class JmeterPluginModule {
  constructor(private _functionTypeRegistryService: FunctionTypeRegistryService) {
    this.registerFunctionTypes();
  }

  private registerFunctionTypes(): void {
    this._functionTypeRegistryService.register(FunctionType.J_METER, 'JMeter', FunctionTypeJMeterComponent);
  }
}
