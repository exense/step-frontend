import { Component, computed, contentChild, inject, input, ViewEncapsulation } from '@angular/core';
import { ArtefactService } from '../../injectables/artefact.service';
import { AbstractArtefact, ReportNode } from '../../../../client/step-client-module';
import { AggregatedArtefactInfo } from '../../types/artefact-types';
import { CustomRegistriesModule } from '../../../custom-registeries/custom-registries.module';
import { ArtefactInlineDetailsHeaderDirective } from '../../directives/artefact-inline-details-header.directive';

@Component({
  selector: 'step-artefact-inline-details',
  templateUrl: './artefact-inline-details.component.html',
  styleUrl: './artefact-inline-details.component.scss',
  imports: [CustomRegistriesModule],
  host: {
    '[class.overflow]': 'overflowContent()',
  },
  encapsulation: ViewEncapsulation.None,
})
export class ArtefactInlineDetailsComponent<A extends AbstractArtefact, R extends ReportNode = ReportNode> {
  private _artefactService = inject(ArtefactService);

  readonly aggregatedInfo = input<AggregatedArtefactInfo<A, R> | undefined>(undefined);
  readonly reportInfo = input<R | undefined>(undefined);
  readonly isVertical = input(false);
  readonly overflowContent = input(false);

  private header = contentChild(ArtefactInlineDetailsHeaderDirective);

  private artefactClass = computed(() => {
    const aggregatedInfo = this.aggregatedInfo();
    const reportInfo = this.reportInfo();
    return aggregatedInfo?.originalArtefact?._class ?? reportInfo?.resolvedArtefact?._class;
  });

  protected readonly context = computed(() => {
    const aggregatedInfo = this.aggregatedInfo();
    const reportInfo = this.reportInfo();
    const isVertical = this.isVertical();
    const headerTemplate = this.header()?.templateRef;
    return { headerTemplate, aggregatedInfo, reportInfo, isVertical };
  });

  protected componentToRender = computed(() => {
    const artefactClass = this.artefactClass();
    const meta = artefactClass ? this._artefactService.getArtefactType(artefactClass) : undefined;
    return meta?.inlineComponent;
  });
}
