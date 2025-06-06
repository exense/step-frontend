import { FunctionLinkComponent } from './components/function-link/function-link.component';
import { FunctionLinkEditorComponent } from './components/function-link/function-link-editor.component';
import { AgentTokenSelectionCriteriaComponent } from './components/agent-token-selection-criteria/agent-token-selection-criteria.component';
import { FunctionTypeLabelPipe } from './pipes/function-type-label.pipe';
import { FunctionSelectionTableComponent } from './components/function-selection-table/function-selection-table.component';
import { KeywordConfigurerUrlPipe } from './pipes/keyword-configurer-url.pipe';
import { FunctionTypeFilterComponent } from './components/function-type-filter/function-type-filter.component';

export * from './keywords-common.initializer';

export * from './components/function-link/function-link.component';
export * from './components/function-link/function-link-editor.component';
export * from './components/function-type-form/function-type-form-component';
export * from './components/agent-token-selection-criteria/agent-token-selection-criteria.component';
export * from './components/function-selection-table/function-selection-table.component';
export * from './components/function-type-filter/function-type-filter.component';
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

export const KEYWORDS_COMMON_IMPORTS = [
  FunctionLinkComponent,
  FunctionLinkEditorComponent,
  AgentTokenSelectionCriteriaComponent,
  FunctionTypeLabelPipe,
  FunctionTypeFilterComponent,
  FunctionSelectionTableComponent,
  KeywordConfigurerUrlPipe,
];
