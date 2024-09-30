import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StepBasicsModule } from '../basics/step-basics.module';
import { StepIconsModule } from '../step-icons/step-icons.module';
import { StepMaterialModule } from '../step-material/step-material.module';
import { DynamicTextfieldComponent } from './components/dynamic-textfield/dynamic-textfield.component';
import { ExpressionInputComponent } from './components/expression-input/expression-input.component';
import { DynamicFieldComponent } from './components/dynamic-field/dynamic-field.component';
import { DynamicFieldObjectEditorComponent } from './components/dynamic-field-object-editor/dynamic-field-object-editor.component';
import { AddFieldButtonComponent } from './components/add-field-button/add-field-button.component';
import { DynamicFieldEditorComponent } from './components/dynamic-field-editor/dynamic-field-editor.component';
import { DynamicCheckboxComponent } from './components/dynamic-checkbox/dynamic-checkbox.component';
import { DynamicJsonComponent } from './components/dynamic-json/dynamic-json.component';
import { ResourceInputModule } from '../resource-input/resource-input.module';
import { DynamicResourceComponent } from './components/dynamic-resource/dynamic-resource.component';
import { AddFieldSchemaButtonComponent } from './components/add-field-schema-button/add-field-schema-button.component';
import { AddSchemaFieldDialogComponent } from './components/add-schema-field-dialog/add-schema-field-dialog.component';
import { TimeRawInputComponent } from './components/time-raw-input/time-raw-input.component';
import { DynamicTimeInputComponent } from './components/dynamic-time-input/dynamic-time-input.component';
import { DynamicFieldIsExpressionEditorAllowedPipe } from './pipes/dynamic-field-is-expression-allowed.pipe';
import { DynamicFieldComplexComponent } from './components/dynamic-field-complex/dynamic-field-complex.component';
import { DynamicFieldArrayEditorComponent } from './components/dynamic-field-array-editor/dynamic-field-array-editor.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
  declarations: [
    DynamicTextfieldComponent,
    ExpressionInputComponent,
    DynamicFieldComponent,
    DynamicFieldComplexComponent,
    DynamicFieldObjectEditorComponent,
    DynamicFieldArrayEditorComponent,
    AddFieldButtonComponent,
    DynamicFieldEditorComponent,
    DynamicCheckboxComponent,
    DynamicJsonComponent,
    DynamicResourceComponent,
    AddFieldSchemaButtonComponent,
    AddSchemaFieldDialogComponent,
    TimeRawInputComponent,
    DynamicTimeInputComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    StepBasicsModule,
    StepMaterialModule,
    StepIconsModule,
    ReactiveFormsModule,
    ResourceInputModule,
    DynamicFieldIsExpressionEditorAllowedPipe,
    NgxMatSelectSearchModule,
  ],
  exports: [
    AddFieldButtonComponent,
    DynamicTextfieldComponent,
    ExpressionInputComponent,
    DynamicFieldComponent,
    DynamicFieldEditorComponent,
    DynamicFieldObjectEditorComponent,
    DynamicCheckboxComponent,
    AddFieldSchemaButtonComponent,
    DynamicJsonComponent,
    DynamicResourceComponent,
    DynamicTimeInputComponent,
  ],
})
export class DynamicFormsModule {}

export * from './components/dynamic-textfield/dynamic-textfield.component';
export * from './components/expression-input/expression-input.component';
export * from './components/dynamic-field/dynamic-field.component';
export * from './components/dynamic-field-object-editor/dynamic-field-object-editor.component';
export * from './components/dynamic-field-editor/dynamic-field-editor.component';
export * from './components/dynamic-checkbox/dynamic-checkbox.component';
export * from './components/dynamic-json/dynamic-json.component';
export * from './components/dynamic-resource/dynamic-resource.component';
export * from './components/add-field-button/add-field-button.component';
export * from './components/add-field-schema-button/add-field-schema-button.component';
export * from './components/dynamic-time-input/dynamic-time-input.component';
export * from './shared/dynamic-field-group-value';
export * from './services/schemas-factory.service';
