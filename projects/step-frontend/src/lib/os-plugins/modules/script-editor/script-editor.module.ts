import { NgModule } from '@angular/core';
import { SimpleOutletComponent, StepCoreModule, ViewRegistryService } from '@exense/step-core';
import { ScriptEditorComponent } from './components/script-editor/script-editor.component';
import './components/script-editor/script-editor.component';

@NgModule({
  declarations: [ScriptEditorComponent],
  imports: [StepCoreModule],
  exports: [ScriptEditorComponent],
})
export class ScriptEditorModule {
  constructor(_viewRegistry: ViewRegistryService) {
    _viewRegistry.registerRoute({
      path: 'scripteditor',
      component: SimpleOutletComponent,
      children: [
        {
          path: ':id',
          component: ScriptEditorComponent,
        },
      ],
    });
  }
}

export * from './components/script-editor/script-editor.component';
