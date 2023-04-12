import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StepMaterialModule } from '../step-material/step-material.module';
import { ArrayFilterComponent } from './components/array-filter/array-filter.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { HexadecimalInputFilterComponent } from './components/input-filter/hexadecimal-input-filter.component';
import { InputFilterComponent } from './components/input-filter/input-filter.component';
import { ResourceLabelComponent } from './components/resource-label/resource-label.component';
import { ArtefactIconPipe } from './pipes/artefact-icon.pipe';
import { HasRightPipe } from './pipes/has-right.pipe';
import { ZIndexDirective } from './directives/z-index.directive';
import { JsonRawEditorComponent } from './components/json-raw-editor/json-raw-editor.component';
import { ElementRefMapDirective } from './directives/element-ref-map.directive';
import { WidthExpandersDirective } from './directives/width-expanders.directive';
import { ModalWindowComponent } from './components/modal-window/modal-window.component';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { LabelDirective } from './directives/label.directive';
import { PrefixDirective } from './directives/prefix.directive';
import { SuffixDirective } from './directives/suffix.directive';
import { HintDirective } from './directives/hint.directive';
import { ErrorDirective } from './directives/error.directive';
import { AlertDirective } from './directives/alert.directive';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StepMaterialModule],
  declarations: [
    ResourceLabelComponent,
    ArrayFilterComponent,
    DateFilterComponent,
    InputFilterComponent,
    HasRightPipe,
    HexadecimalInputFilterComponent,
    ArtefactIconPipe,
    ZIndexDirective,
    JsonRawEditorComponent,
    ElementRefMapDirective,
    WidthExpandersDirective,
    ModalWindowComponent,
    FormFieldComponent,
    LabelDirective,
    PrefixDirective,
    SuffixDirective,
    HintDirective,
    ErrorDirective,
    AlertDirective,
  ],
  exports: [
    ResourceLabelComponent,
    ArrayFilterComponent,
    DateFilterComponent,
    InputFilterComponent,
    HasRightPipe,
    HexadecimalInputFilterComponent,
    ArtefactIconPipe,
    ZIndexDirective,
    JsonRawEditorComponent,
    ElementRefMapDirective,
    WidthExpandersDirective,
    ModalWindowComponent,
    FormFieldComponent,
    LabelDirective,
    PrefixDirective,
    SuffixDirective,
    HintDirective,
    ErrorDirective,
    AlertDirective,
  ],
})
export class StepBasicsModule {}

export * from './components/array-filter/array-filter.component';
export * from './components/date-filter/date-filter.component';
export * from './components/input-filter/hexadecimal-input-filter.component';
export * from './components/input-filter/input-filter.component';
export * from './components/resource-label/resource-label.component';
export * from './components/json-raw-editor/json-raw-editor.component';
export * from './components/modal-window/modal-window.component';
export * from './components/form-field/form-field.component';
export * from './directives/z-index.directive';
export * from './pipes/artefact-icon.pipe';
export * from './pipes/has-right.pipe';
export * from './services/artefact-types.service';
export * from './services/login.service';
export * from './services/auth.service';
export * from './services/hybrid-injector-helper';
export * from './services/project-management-helper.service';
export * from './shared/angularjs-provider-options';
export * from './shared/auth-context.interface';
export * from './shared/compare-condition.enum';
export * from './shared/login-strategy';
export * from './shared/alert-type.enum';
export * from './shared/restore-dialog-data';
export * from './shared/project-management-helper-strategy.interface';
export * from './shared/project-info.interface';
export * from './directives/element-ref-map.directive';
export * from './directives/width-expanders.directive';
export * from './directives/label.directive';
export * from './directives/prefix.directive';
export * from './directives/suffix.directive';
export * from './directives/hint.directive';
export * from './directives/error.directive';
export * from './directives/alert.directive';
