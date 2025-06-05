import { inject, Pipe, PipeTransform } from '@angular/core';
import { FunctionTypeRegistryService } from '../../custom-registeries/custom-registries.module';

@Pipe({
  name: 'functionTypeLabel',
  standalone: false,
})
export class FunctionTypeLabelPipe implements PipeTransform {
  private _functionTypeRegistry = inject(FunctionTypeRegistryService);

  transform(type: string): string {
    return this._functionTypeRegistry.getItemInfo(type)?.label ?? '';
  }
}
