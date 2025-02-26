import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepCoreModule, PluginLazyLoad, ImportMeta } from '@exense/step-core';
import { ScriptEditorModule } from './modules/script-editor/script-editor.module';
import { FunctionPackagesModule } from './modules/function-packages/function-packages.module';
import { NodePluginModule } from './modules/node-plugin/node-plugin.module';
import { JmeterPluginModule } from './modules/jmeter-plugin/jmeter-plugin.module';
import { MavenRepositoryModule } from './modules/maven-repository/maven-repository.module';
import { YamlPlanEditorModule } from './modules/yaml-plan-editor/yaml-plan-editor.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, StepCoreModule],
})
export class PluginModule extends PluginLazyLoad {
  protected override getPluginsLazyLoadMeta(): Record<string, ImportMeta> {
    return {
      scriptEditor: () => Promise.resolve({ Module: ScriptEditorModule }),
      functionPackages: () => Promise.resolve({ Module: FunctionPackagesModule }),
      NodePlugin: () => Promise.resolve({ Module: NodePluginModule }),
      jmeterPlugin: () => Promise.resolve({ Module: JmeterPluginModule }),
      mavenRepository: {
        isForceLoad: true,
        load: () => Promise.resolve({ Module: MavenRepositoryModule }),
      },
      yamlPlanEditor: {
        isForceLoad: true,
        load: () => Promise.resolve({ Module: YamlPlanEditorModule }),
      },
    };
  }
}
