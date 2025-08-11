import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ArtefactService } from '../../injectables/artefact.service';
import { AggregatedReportView, ReportNode } from '../../../../client/step-client-module';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { chooseStatusWithMostPriority } from '../../types/choose-status-with-most-priority';

type Node = ReportNode | AggregatedReportView;

@Component({
  selector: 'step-report-node-icon',
  templateUrl: './report-node-icon.component.html',
  styleUrls: ['./report-node-icon.component.scss'],
  host: {
    '[class.round-box]': 'roundBox()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepBasicsModule],
})
export class ReportNodeIconComponent {
  private _artefactTypes = inject(ArtefactService);

  /** @Input() **/
  readonly node = input<Node | undefined>();

  /** @Input() **/
  readonly highlightStatus = input(true);

  /** @Input() **/
  readonly roundBox = input(false);

  private artefact = computed(() => {
    const node = this.node();
    return (node as ReportNode)?.resolvedArtefact ?? (node as AggregatedReportView)?.artefact ?? undefined;
  });

  private reportNodeStatus = computed(() => {
    const node = this.node() as ReportNode;
    return node?.status;
  });

  private aggregatedReportViewStatus = computed(() => {
    const node = this.node() as AggregatedReportView;
    if (!node?.countByStatus) {
      return undefined;
    }
    const statuses = Object.keys(node?.countByStatus ?? {});
    return chooseStatusWithMostPriority(...statuses);
  });

  protected readonly icon = computed(() => {
    const artefact = this.artefact();
    if (!artefact) {
      return undefined;
    }
    return this._artefactTypes.getArtefactType(artefact?._class)?.icon ?? this._artefactTypes.defaultIcon;
  });

  protected readonly artefactClass = computed(() => {
    const artefact = this.artefact();
    if (!artefact) {
      return '';
    }
    return artefact?._class ?? '';
  });

  protected readonly statusClass = computed(() => {
    const node = this.node() as ReportNode;
    const reportNodeStatus = this.reportNodeStatus();
    const aggregatedStatus = this.aggregatedReportViewStatus();
    const highlightStatus = this.highlightStatus();

    const status = reportNodeStatus ?? aggregatedStatus;

    if (!status || !highlightStatus) {
      return undefined;
    }
    return `step-node-status-${status}`;
  });
}
