import { BaseRegistryService } from './base-registry.service';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { Injectable } from '@angular/core';
import { CustomRegistryService } from './custom-registry.service';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { STEP_CORE_JS } from '../../../angularjs';

@Injectable({
  providedIn: 'root',
})
export class PlanTypeRegistryService extends BaseRegistryService {
  protected readonly registryType: CustomRegistryType = CustomRegistryType.PLAN_TYPE;

  constructor(_customRegistry: CustomRegistryService) {
    super(_customRegistry);
  }
}

getAngularJSGlobal()
  .module(STEP_CORE_JS)
  .service('planTypeRegistryService', downgradeInjectable(PlanTypeRegistryService));
