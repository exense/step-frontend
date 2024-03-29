import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StepBasicsModule } from '../basics/step-basics.module';
import { StepMaterialModule } from '../step-material/step-material.module';
import { FunctionLinkComponent } from './components/function-link/function-link.component';
import { AgentTokenSelectionCriteriaComponent } from './components/agent-token-selection-criteria/agent-token-selection-criteria.component';
import { TableModule } from '../table/table.module';
import { EntitiesSelectionModule } from '../entities-selection/entities-selection.module';
import { FunctionTypeLabelPipe } from './pipes/function-type-label.pipe';
import { FunctionSelectionTableComponent } from './components/function-selection-table/function-selection-table.component';
import { EntityModule, EntityRegistry } from '../entity/entity.module';
import { CustomRegistriesModule } from '../custom-registeries/custom-registries.module';
import { FunctionBulkOperationsRegisterService } from './injectables/function-bulk-operations-register.service';
import { FunctionLinkEditorComponent } from './components/function-link/function-link-editor.component';
import { KeywordConfigurerUrlPipe } from './pipes/keyword-configurer-url.pipe';

@NgModule({
  declarations: [
    FunctionLinkComponent,
    FunctionLinkEditorComponent,
    AgentTokenSelectionCriteriaComponent,
    FunctionTypeLabelPipe,
    FunctionSelectionTableComponent,
    KeywordConfigurerUrlPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StepBasicsModule,
    StepMaterialModule,
    CustomRegistriesModule,
    TableModule,
    EntityModule,
    EntitiesSelectionModule,
  ],
  exports: [
    FunctionLinkComponent,
    FunctionLinkEditorComponent,
    AgentTokenSelectionCriteriaComponent,
    FunctionTypeLabelPipe,
    FunctionSelectionTableComponent,
    KeywordConfigurerUrlPipe,
  ],
})
export class KeywordsCommonModule {
  constructor(
    private _entityRegistry: EntityRegistry,
    private _bulkRegister: FunctionBulkOperationsRegisterService,
  ) {
    this.registerEntities();
    this._bulkRegister.register();
  }

  private registerEntities(): void {
    this._entityRegistry.register('functions', 'Keyword', {
      icon: 'keyword',
      component: FunctionSelectionTableComponent,
    });
  }
}

export * from './components/function-link/function-link.component';
export * from './components/function-link/function-link-editor.component';
export * from './components/function-type-form/function-type-form-component';
export * from './components/agent-token-selection-criteria/agent-token-selection-criteria.component';
export * from './components/function-selection-table/function-selection-table.component';
export * from './injectables/function-actions.service';
export * from './injectables/function-dialogs-config-factory.service';
export * from './injectables/function-configuration-api.service';
export * from './injectables/function-type-parent-form.service';
export * from './injectables/function-configuration-dialog.resolver';
export * from './types/function-dialogs-config.interface';
export * from './types/function-configuration-dialog-data.interface';
export * from './types/function-configuration-dialog.form';
export * from './types/agent-token-selection-criteria.form';
export * from './types/function-type.enum';
export * from './types/function-type-form-component-context.interface';
export * from './pipes/function-type-label.pipe';
export * from './pipes/keyword-configurer-url.pipe';
