import { EditableLabelComponent } from './components/editable-label/editable-label.component';
import { EditableTextareaLabelComponent } from './components/editable-textarea-label/editable-textarea-label.component';
import { EditableDropdownLabelComponent } from './components/editable-dropdown-label/editable-dropdown-label.component';
import { EditableLabelTemplateDirective } from './directives/editable-label-template.directive';
import { EditableListItemTemplateDirective } from './directives/editable-list-item-template.directive';

export * from './components/editable-label/editable-label.component';
export * from './components/editable-textarea-label/editable-textarea-label.component';
export * from './components/editable-dropdown-label/editable-dropdown-label.component';
export * from './directives/editable-label-template.directive';
export * from './directives/editable-list-item-template.directive';
export * from './injectables/text-serialize.service';

export const EDITABLE_LABELS_EXPORTS = [
  EditableLabelComponent,
  EditableTextareaLabelComponent,
  EditableDropdownLabelComponent,
  EditableLabelTemplateDirective,
  EditableListItemTemplateDirective,
];
