import { Component, computed, inject, input } from '@angular/core';
import { AggregatedArtefactInfo } from '../../shared';
import { ArtefactService } from '../../services/artefact.service';

@Component({
  selector: 'step-artefact-inline-details',
  templateUrl: './artefact-inline-details.component.html',
  styleUrl: './artefact-inline-details.component.scss',
})
export class ArtefactInlineDetailsComponent<T extends AggregatedArtefactInfo> {
  private _artefactService = inject(ArtefactService);

  readonly info = input.required<T>();
  readonly isVertical = input(false);

  protected readonly context = computed(() => {
    const info = this.info();
    const isVertical = this.isVertical();
    return { info, isVertical };
  });

  protected componentToRender = computed(() => {
    const artefact = this.info().originalArtefact;
    const meta = artefact?._class ? this._artefactService.getArtefactType(artefact._class) : undefined;
    return meta?.inlineComponent;
  });
}
