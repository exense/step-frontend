import { Component, computed, inject, input } from '@angular/core';
import { ReportNode } from '../../client/step-client-module';
import { ArtefactService } from '../../services/artefact.service';

@Component({
  selector: 'step-report-node-artefact-details',
  templateUrl: './report-node-artefact-details.component.html',
  styleUrl: './report-node-artefact-details.component.scss',
})
export class ReportNodeArtefactDetailsComponent<R extends ReportNode> {
  private _artefactService = inject(ArtefactService);

  readonly reportInfo = input<R | undefined>(undefined);

  private artefactClass = computed(() => {
    const reportInfo = this.reportInfo();
    return reportInfo?.resolvedArtefact?._class;
  });

  protected componentToRender = computed(() => {
    const artefactClass = this.artefactClass();
    const meta = artefactClass ? this._artefactService.getArtefactType(artefactClass) : undefined;
    console.log('COMPONENT', meta?.reportDetailsComponent);
    return meta?.reportDetailsComponent;
  });
}
