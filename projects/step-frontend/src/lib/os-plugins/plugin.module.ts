import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepCoreModule, Plugin, PluginLazyLoad, ImportMeta } from '@exense/step-core';
import { UpgradeModule } from '@angular/upgrade/static';
import { osPluginModule } from './angularjs/os-plugin.module';

@Plugin(osPluginModule.name)
@NgModule({
  declarations: [],
  imports: [CommonModule, StepCoreModule, UpgradeModule],
})
export class PluginModule extends PluginLazyLoad {
  constructor() {
    super(osPluginModule);
  }

  protected override getPluginsLazyLoadMeta(): Record<string, ImportMeta> {
    return {
      scriptEditor: () =>
        import('./modules/script-editor/script-editor.module').then((m) => ({
          Module: m.ScriptEditorModule,
        })),
    };
  }
}

export * from './angularjs/os-plugin.module';
