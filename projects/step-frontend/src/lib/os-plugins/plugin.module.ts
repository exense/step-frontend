import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepCoreModule, PluginLazyLoad, ImportMeta } from '@exense/step-core';
import { UpgradeModule } from '@angular/upgrade/static';

@NgModule({
  declarations: [],
  imports: [CommonModule, StepCoreModule, UpgradeModule],
})
export class PluginModule extends PluginLazyLoad {
  constructor() {
    super();
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
