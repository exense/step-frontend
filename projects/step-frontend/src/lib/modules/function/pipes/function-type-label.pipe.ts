import { Inject, Pipe, PipeTransform } from '@angular/core';
import { AJS_FUNCTION_TYPE_REGISTRY } from '@exense/step-core';

@Pipe({
  name: 'functionTypeLabel',
})
export class FunctionTypeLabelPipe implements PipeTransform {
  constructor(@Inject(AJS_FUNCTION_TYPE_REGISTRY) private _functionTypeRegistry: any) {}

  transform(type: string): string {
    return this._functionTypeRegistry.getLabel(type);
  }
}
