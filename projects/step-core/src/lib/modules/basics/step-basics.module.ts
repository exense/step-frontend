import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceLabelComponent } from './components/resource-label/resource-label.component';
import { InputGroupComponent } from './components/input-group/input-group.component';
import { ArrayFilterComponent } from './components/array-filter/array-filter.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StepMaterialModule } from '../step-material/step-material.module';
import { InputFilterComponent } from './components/input-filter/input-filter.component';
import { HasRightPipe } from './pipes/has-right.pipe';
import { HexadecimalInputFilterComponent } from './components/input-filter/hexadecimal-input-filter.component';
import { ArtefactIconPipe } from './pipes/artefact-icon.pipe';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StepMaterialModule],
  declarations: [
    ResourceLabelComponent,
    InputGroupComponent,
    ArrayFilterComponent,
    DateFilterComponent,
    InputFilterComponent,
    HasRightPipe,
    HexadecimalInputFilterComponent,
    ArtefactIconPipe,
  ],
  exports: [
    ResourceLabelComponent,
    InputGroupComponent,
    ArrayFilterComponent,
    DateFilterComponent,
    InputFilterComponent,
    HasRightPipe,
    HexadecimalInputFilterComponent,
    ArtefactIconPipe,
  ],
})
export class StepBasicsModule {}

export * from './components/input-group/input-group.component';
export * from './components/resource-label/resource-label.component';
export * from './components/array-filter/array-filter.component';
export * from './components/date-filter/date-filter.component';
export * from './components/input-filter/input-filter.component';
export * from './components/input-filter/hexadecimal-input-filter.component';
export * from './shared/compare-condition.enum';
export * from './pipes/has-right.pipe';
export * from './pipes/artefact-icon.pipe';
export * from './services/auth.service';
export * from './services/artefact-types.service';
export * from './shared/angularjs-provider-options';
export * from './shared/auth-context.interface';
