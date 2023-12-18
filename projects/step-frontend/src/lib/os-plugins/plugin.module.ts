import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepCoreModule, PluginLazyLoad, ImportMeta } from '@exense/step-core';

@NgModule({
  declarations: [],
  imports: [CommonModule, StepCoreModule],
})
export class PluginModule extends PluginLazyLoad {
  protected override getPluginsLazyLoadMeta(): Record<string, ImportMeta> {
    return {
      scriptEditor: () =>
        import('./modules/script-editor/script-editor.module').then((m) => ({
          Module: m.ScriptEditorModule,
        })),
    };
  }
}
