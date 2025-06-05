import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { ArtefactService } from '../../injectables/artefact.service';
import { AbstractArtefact, ReportNode } from '../../../../client/step-client-module';
import { AggregatedArtefactInfo } from '../../types/artefact-types';
import { CustomRegistriesModule } from '../../../custom-registeries/custom-registries.module';

@Component({
  selector: 'step-artefact-inline-details',
  templateUrl: './artefact-inline-details.component.html',
  styleUrl: './artefact-inline-details.component.scss',
  host: {
    '[class.overflow]': 'overflowContent()',
  },
  imports: [CustomRegistriesModule],
  encapsulation: ViewEncapsulation.None,
})
export class ArtefactInlineDetailsComponent<A extends AbstractArtefact, R extends ReportNode = ReportNode> {
  private _artefactService = inject(ArtefactService);

  readonly aggregatedInfo = input<AggregatedArtefactInfo<A, R> | undefined>(undefined);
  readonly reportInfo = input<R | undefined>(undefined);
  readonly isVertical = input(false);
  readonly overflowContent = input(false);

  private artefactClass = computed(() => {
    const aggregatedInfo = this.aggregatedInfo();
    const reportInfo = this.reportInfo();
    return aggregatedInfo?.originalArtefact?._class ?? reportInfo?.resolvedArtefact?._class;
  });

  protected readonly context = computed(() => {
    const aggregatedInfo = this.aggregatedInfo();
    const reportInfo = this.reportInfo();
    const isVertical = this.isVertical();
    return { aggregatedInfo, reportInfo, isVertical };
  });

  protected componentToRender = computed(() => {
    const artefactClass = this.artefactClass();
    const meta = artefactClass ? this._artefactService.getArtefactType(artefactClass) : undefined;
    return meta?.inlineComponent;
  });
}
