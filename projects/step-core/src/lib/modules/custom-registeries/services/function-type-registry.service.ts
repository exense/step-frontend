import { BaseRegistryService } from './base-registry.service';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FunctionTypeRegistryService extends BaseRegistryService {
  protected override readonly registryType: CustomRegistryType = CustomRegistryType.FUNCTION_TYPE;
}
