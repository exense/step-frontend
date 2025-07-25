import { inject, NgModule } from '@angular/core';
import {
  AugmentedKeywordsService,
  checkEntityGuardFactory,
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
import { canDeactivateFn } from './guards/can-deactivate-function';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ActivatedRouteSnapshot } from '@angular/router';

@NgModule({
  declarations: [ScriptEditorComponent, FunctionTypeScriptComponent],
  imports: [StepCoreModule, NgxMatSelectSearchModule],
  exports: [ScriptEditorComponent, FunctionTypeScriptComponent],
})
export class ScriptEditorModule {
  constructor(
    private _viewRegistry: ViewRegistryService,
    private _functionTypeRegistryService: FunctionTypeRegistryService,
  ) {
    this.registerViews();
    this.registerFunctionTypes();
  }

  private registerViews(): void {
    this._viewRegistry.registerRoute({
      path: 'script-editor',
      component: SimpleOutletComponent,
      children: [
        {
          path: ':id',
          component: ScriptEditorComponent,
          canActivate: [
            checkEntityGuardFactory({
              entityType: 'keyword',
              getEntity: (id) => inject(AugmentedKeywordsService).getFunctionByIdCached(id),
              getEditorUrl: (id) => `/script-editor/${id}`,
            }),
          ],
          resolve: {
            keyword: (route: ActivatedRouteSnapshot) => {
              const id = route.params['id'];
              return inject(AugmentedKeywordsService).getFunctionByIdCached(id);
            },
          },
          canDeactivate: [
            canDeactivateFn,
            () => {
              inject(AugmentedKeywordsService).cleanupCache();
              return true;
            },
          ],
        },
      ],
    });
  }

  private registerFunctionTypes(): void {
    this._functionTypeRegistryService.register(
      FunctionType.SCRIPT,
      'Script (Java, JS, Groovy, etc)',
      FunctionTypeScriptComponent,
    );
  }
}

export * from './components/function-type-script/function-type-script.component';
export * from './components/script-editor/script-editor.component';
