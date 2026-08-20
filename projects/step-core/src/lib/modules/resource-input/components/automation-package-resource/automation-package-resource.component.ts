import { Component, computed, inject, input, output, untracked } from '@angular/core';
import { ApResourcePickerDataProviderService } from '../../injectables/ap-resource-picker-data-provider.service';
import { ResourceInputUtilsService } from '../../injectables/resource-input-utils.service';
import { FilePickerService, SelectionMode } from '../../../file-picker';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-automation-package-resource',
  imports: [StepBasicsModule],
  templateUrl: './automation-package-resource.component.html',
  styleUrl: './automation-package-resource.component.scss',
})
export class AutomationPackageResourceComponent {
  private _utils = inject(ResourceInputUtilsService);
  private _apFilePicker = inject(FilePickerService);
  private _apPickerDataProviderService = inject(ApResourcePickerDataProviderService);

  readonly apId = input.required<string>();
  readonly isDisabled = input(false);
  readonly isInvalid = input(false);
  readonly isTouched = input(false);

  readonly label = input<string | undefined>();
  readonly helpIconTooltip = input<string | undefined>();
  readonly showRequiredMarker = input(false);
  readonly value = input<string | undefined>();
  readonly valueChange = output<string | undefined>();
  readonly blur = output<void>();

  protected readonly apResourcePath = computed(() => {
    const apId = this.apId();
    const value = this.value();
    if (!apId) {
      return undefined;
    }
    return this._utils.getResourceApPath(value);
  });

  protected handleApPathChange(value?: string): void {
    const apId = untracked(() => this.apId());
    if (!apId) {
      return;
    }
    const model = !value ? undefined : this._utils.convertToApResourceValue(apId, value);
    this.valueChange.emit(model);
  }

  protected downloadApResource(): void {
    const apPath = untracked(() => this.apResourcePath());
    if (!apPath) {
      return;
    }
    this._apPickerDataProviderService.downloadResource(apPath);
  }

  protected openApResourceChooser(): void {
    this._apFilePicker
      .showFilePicker('Select Automation Package Resource', { selectionMode: SelectionMode.FILE })
      .subscribe((res) => {
        if (res !== undefined) {
          this.handleApPathChange(res.filePath);
        }
      });
  }
}
