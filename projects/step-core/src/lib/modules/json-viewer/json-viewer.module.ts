import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyValueInlineComponent } from './components/key-value-inline/key-value-inline.component';
import { PrettyPrintInlineComponent } from './components/pretty-print-inline/pretty-print-inline.component';
import { PrettyPrintComponent } from './components/pretty-print/pretty-print.component';
import { KeyValueComponent } from './components/key-value/key-value.component';
import { JsonViewerComponent } from './components/json-viewer/json-viewer.component';
import { ToolboxComponent } from './components/toolbox/toolbox.component';
import { StepMaterialModule } from '../step-material/step-material.module';

@NgModule({
  declarations: [
    KeyValueInlineComponent,
    PrettyPrintInlineComponent,
    PrettyPrintComponent,
    KeyValueComponent,
    JsonViewerComponent,
    ToolboxComponent,
  ],
  imports: [CommonModule, StepMaterialModule],
  exports: [JsonViewerComponent],
})
export class JsonViewerModule {}

export * from './shared/viewer-format.enum';
export * from './services/json-viewer-formatter.service';
export * from './components/key-value/key-value.component';
export * from './components/key-value-inline/key-value-inline.component';
export * from './components/pretty-print/pretty-print.component';
export * from './components/pretty-print-inline/pretty-print-inline.component';
export * from './components/json-viewer/json-viewer.component';
export * from './components/toolbox/toolbox.component';
