import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StepBasicsModule } from '../basics/step-basics.module';
import { StepIconsModule } from '../step-icons/step-icons.module';
import { StepMaterialModule } from '../step-material/step-material.module';
import { DynamicTextfieldComponent } from './components/dynamic-textfield/dynamic-textfield.component';
import { ExpressionInputComponent } from './components/expression-input/expression-input.component';
import { DynamicFieldComponent } from './components/dynamic-field/dynamic-field.component';
import { DynamicFieldGroupEditorComponent } from './components/dynamic-field-group-editor/dynamic-field-group-editor.component';
import { AddFieldButtonComponent } from './components/add-field-button/add-field-button.component';
import { DynamicFieldEditorComponent } from './components/dynamic-field-editor/dynamic-field-editor.component';
import { DynamicCheckboxComponent } from './components/dynamic-checkbox/dynamic-checkbox.component';

@NgModule({
  declarations: [
    DynamicTextfieldComponent,
    ExpressionInputComponent,
    DynamicFieldComponent,
    DynamicFieldGroupEditorComponent,
    AddFieldButtonComponent,
    DynamicFieldEditorComponent,
    DynamicCheckboxComponent,
  ],
  imports: [CommonModule, FormsModule, StepBasicsModule, StepMaterialModule, StepIconsModule, ReactiveFormsModule],
  exports: [
    DynamicTextfieldComponent,
    ExpressionInputComponent,
    DynamicFieldComponent,
    DynamicFieldEditorComponent,
    DynamicFieldGroupEditorComponent,
    DynamicCheckboxComponent,
  ],
})
export class DynamicFormsModule {}

export * from './components/dynamic-textfield/dynamic-textfield.component';
export * from './components/expression-input/expression-input.component';
export * from './components/dynamic-field/dynamic-field.component';
export * from './components/dynamic-field-group-editor/dynamic-field-group-editor.component';
export * from './components/dynamic-field-editor/dynamic-field-editor.component';
export * from './components/dynamic-checkbox/dynamic-checkbox.component';
export * from './shared/dynamic-fields-schema';
export * from './shared/dynamic-field-group-value';
export * from './services/schemas-factory.service';
