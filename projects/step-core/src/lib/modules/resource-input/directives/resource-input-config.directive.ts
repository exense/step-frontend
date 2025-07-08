import { computed, Directive, effect, inject, input } from '@angular/core';
import { ResourceConfig } from '../types/resource-config';
import { RESOURCE_INPUT } from '../injectables/resource-input.token';

@Directive({
  selector: '[stepResourceInputConfig]',
  standalone: true,
})
export class ResourceInputConfigDirective {
  private _resourceInputService = inject(RESOURCE_INPUT);

  readonly type = input.required<string>();
  readonly isBounded = input(false);
  readonly supportsDirectory = input(false);
  readonly withSaveButton = input(false);
  readonly saveButtonLabel = input('Save');

  readonly withChooseExistingResourceButton = input(false);
  readonly withClearButton = input(true);
  readonly withDynamicSwitch = input(false);
  readonly preserveExistingResource = input(false);
  readonly disableServerPath = input(false);

  readonly config = computed<ResourceConfig>(() => {
    const type = this.type();
    const isBounded = this.isBounded();
    const supportsDirectory = this.supportsDirectory();
    const withSaveButton = this.withSaveButton();
    const saveButtonLabel = this.saveButtonLabel();
    const withChooseExistingResourceButton = this.withChooseExistingResourceButton();
    const withClearButton = this.withClearButton();
    const withDynamicSwitch = this.withDynamicSwitch();
    const preventExistingResource = this.preserveExistingResource();
    const disableServerPath = this.disableServerPath();
    return {
      type,
      isBounded,
      supportsDirectory,
      withSaveButton,
      saveButtonLabel,
      withChooseExistingResourceButton,
      withClearButton,
      withDynamicSwitch,
      preventExistingResource,
      disableServerPath,
    };
  });

  private effectSyncConfig = effect(() => {
    const config = this.config();
    this._resourceInputService.setConfig(config);
  });
}
