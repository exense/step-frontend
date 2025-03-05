import { NgModule } from '@angular/core';
import { PlanTypeRegistryService, StepCoreModule } from '@exense/step-core';
import { YamlPlanEditorComponent } from './components/yaml-plan-editor/yaml-plan-editor.component';

@NgModule({
  declarations: [YamlPlanEditorComponent],
  imports: [StepCoreModule],
  exports: [YamlPlanEditorComponent],
})
export class YamlPlanEditorModule {
  constructor(_panTypeRegistry: PlanTypeRegistryService) {
    /*
      Currently we should not allow yaml plans due to difficulty to use it without code completion

    _panTypeRegistry.register(
      'step.plans.parser.yaml.editor.YamlEditorPlan',
      'Yaml Plan Editor',
      YamlPlanEditorComponent,
    );
     */
  }
}

export * from './components/yaml-plan-editor/yaml-plan-editor.component';
