import { BaseRegistryService } from './base-registry.service';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FunctionPackageTypeRegistryService extends BaseRegistryService {
  protected override readonly registryType: CustomRegistryType = CustomRegistryType.FUNCTION_PACKAGE_TYPE;

  override register(type: string, label: string): void {
    super.register(type, label, undefined);
  }
}
