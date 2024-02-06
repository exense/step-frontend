import { NgModule } from '@angular/core';
import {
  FunctionType,
  FunctionTypeRegistryService,
  SimpleOutletComponent,
  StepCoreModule,
  ViewRegistryService,
} from '@exense/step-core';
import { ScriptEditorComponent } from './components/script-editor/script-editor.component';
import './components/script-editor/script-editor.component';
import { FunctionTypeScriptComponent } from './components/function-type-script/function-type-script.component';
import './components/function-type-script/function-type-script.component';
import { AuthGuardService } from './injectables/authguard-service';

@NgModule({
  declarations: [ScriptEditorComponent, FunctionTypeScriptComponent],
  imports: [StepCoreModule],
  exports: [ScriptEditorComponent, FunctionTypeScriptComponent],
})
export class ScriptEditorModule {
  constructor(
    private _viewRegistry: ViewRegistryService,
    private _functionTypeRegistryService: FunctionTypeRegistryService
  ) {
    this.registerViews();
    this.registerFunctionTypes();
  }

  private registerViews(): void {
    this._viewRegistry.registerRoute({
      path: 'scripteditor',
      component: SimpleOutletComponent,
      children: [
        {
          path: ':id',
          component: ScriptEditorComponent,
          canDeactivate: [AuthGuardService],
        },
      ],
    });
  }

  private registerFunctionTypes(): void {
    this._functionTypeRegistryService.register(
      FunctionType.SCRIPT,
      'Script (Java, JS, Groovy, etc)',
      FunctionTypeScriptComponent
    );
  }
}

export * from './components/function-type-script/function-type-script.component';
export * from './components/script-editor/script-editor.component';
