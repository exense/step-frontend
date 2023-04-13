import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { ScriptEditorComponent } from './components/script-editor/script-editor.component';
import './components/script-editor/script-editor.component';

@NgModule({
  declarations: [ScriptEditorComponent],
  imports: [StepCoreModule, StepCommonModule],
  exports: [ScriptEditorComponent],
})
export class ScriptEditorModule {}
