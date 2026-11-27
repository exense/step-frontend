import { inject, Pipe, PipeTransform } from '@angular/core';
import { ArtefactPanelDefaultsService } from '../injectables/artefact-panel-defaults.service';

@Pipe({ name: 'panelFieldConfigured', standalone: true })
export class PanelFieldConfiguredPipe implements PipeTransform {
  private readonly _panelDefaults = inject(ArtefactPanelDefaultsService);

  transform(
    field: Parameters<ArtefactPanelDefaultsService['isNonDefault']>[0],
    defaultValue: Parameters<ArtefactPanelDefaultsService['isNonDefault']>[1],
  ): boolean {
    return this._panelDefaults.isNonDefault(field, defaultValue);
  }
}
