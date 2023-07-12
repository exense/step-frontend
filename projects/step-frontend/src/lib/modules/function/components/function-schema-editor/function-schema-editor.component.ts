import { Component, EventEmitter, Input, Output } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, DynamicFieldsSchema } from '@exense/step-core';

@Component({
  selector: 'step-function-schema-editor',
  templateUrl: './function-schema-editor.component.html',
  styleUrls: ['./function-schema-editor.component.scss'],
})
/**
 * @deprecated This component should be removed as soon as SED-2000 will be merged
 * Used as bridge for angularJS
 * **/
export class FunctionSchemaEditorComponent {
  @Input() label?: string;
  @Input() schema?: DynamicFieldsSchema;
  @Output() schemaChange = new EventEmitter<DynamicFieldsSchema | undefined>();
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepFunctionSchemaEditor', downgradeComponent({ component: FunctionSchemaEditorComponent }));
