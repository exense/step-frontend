import { computed, Directive, effect, inject, input } from '@angular/core';
import { ResourceConfig } from '../../types/resource-config';
import { RESOURCE_INPUT } from '../../injectables/resource-input.token';
import { RESOURCE_AP_ID } from '../../injectables/resource-ap-id.token';

@Directive({
  selector: '[stepResourceInputConfig]',
  standalone: true,
})
export class ResourceInputConfigDirective {
  private _resourceInputService = inject(RESOURCE_INPUT);
  private _resourceAutomationPackageId = inject(RESOURCE_AP_ID, { optional: true }) ?? undefined;

  readonly type = input.required<string>();
  readonly isBounded = input(false);
  readonly supportsDirectory = input(false);

  readonly withChooseExistingResourceButton = input(true);
  readonly searchTypes = input<string[] | undefined>(undefined);
  readonly withClearButton = input(true);
  readonly withDynamicSwitch = input(false);
  readonly preserveExistingResource = input(false);
  readonly disableServerPath = input(false);
  readonly withUploadFromFileSystem = input(true);
  readonly ignoreAutomationPackage = input(false);

  readonly config = computed<ResourceConfig>(() => {
    const type = this.type();
    const isBounded = this.isBounded();
    const supportsDirectory = this.supportsDirectory();
    const withChooseExistingResourceButton = this.withChooseExistingResourceButton();
    const searchTypes = this.searchTypes();
    const withClearButton = this.withClearButton();
    const withDynamicSwitch = this.withDynamicSwitch();
    const preventExistingResource = this.preserveExistingResource();
    const disableServerPath = this.disableServerPath();
    const withUploadFromFileSystem = this.withUploadFromFileSystem();
    const ignoreAutomationPackage = this.ignoreAutomationPackage();
    const apPackageId = this._resourceAutomationPackageId?.();
    const automationPackageId = ignoreAutomationPackage ? undefined : apPackageId;

    return {
      type,
      isBounded,
      supportsDirectory,
      withChooseExistingResourceButton,
      searchTypes,
      withClearButton,
      withDynamicSwitch,
      preventExistingResource,
      disableServerPath,
      withUploadFromFileSystem,
      automationPackageId,
    };
  });

  private effectSyncConfig = effect(() => {
    const config = this.config();
    if (!!config.automationPackageId) {
      return;
    }
    this._resourceInputService.setConfig(config);
  });
}
