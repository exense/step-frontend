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
  ],
  exports: [
    ResourceLabelComponent,
    ArrayFilterComponent,
    DateFilterComponent,
    InputFilterComponent,
    HasRightPipe,
    HexadecimalInputFilterComponent,
    ArtefactIconPipe,
  ],
})
export class StepBasicsModule {}

export * from './components/array-filter/array-filter.component';
export * from './components/date-filter/date-filter.component';
export * from './components/input-filter/hexadecimal-input-filter.component';
export * from './components/input-filter/input-filter.component';
export * from './components/resource-label/resource-label.component';
export * from './pipes/artefact-icon.pipe';
export * from './pipes/has-right.pipe';
export * from './services/artefact-types.service';
export * from './services/login.service';
export * from './services/auth.service';
export * from './shared/angularjs-provider-options';
export * from './shared/auth-context.interface';
export * from './shared/compare-condition.enum';
export * from './shared/login-strategy';
