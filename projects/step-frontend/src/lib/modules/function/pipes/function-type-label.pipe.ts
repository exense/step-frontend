import { inject, Pipe, PipeTransform } from '@angular/core';
import { FunctionTypeRegistryService } from '@exense/step-core';

@Pipe({
  name: 'functionTypeLabel',
})
export class FunctionTypeLabelPipe implements PipeTransform {
  private _functionTypeRegistry = inject(FunctionTypeRegistryService);

  transform(type: string): string {
    return this._functionTypeRegistry.getItemInfo(type)?.label ?? '';
  }
}
