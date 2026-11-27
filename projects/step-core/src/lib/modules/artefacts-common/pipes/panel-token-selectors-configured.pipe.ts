import { inject, Pipe, PipeTransform } from '@angular/core';
import { ArtefactPanelDefaultsService } from '../injectables/artefact-panel-defaults.service';

@Pipe({ name: 'panelTokenSelectorsConfigured', standalone: true })
export class PanelTokenSelectorsConfiguredPipe implements PipeTransform {
  private readonly _panelDefaults = inject(ArtefactPanelDefaultsService);

  transform(field: Parameters<ArtefactPanelDefaultsService['hasTokenSelectors']>[0]): boolean {
    return this._panelDefaults.hasTokenSelectors(field);
  }
}
