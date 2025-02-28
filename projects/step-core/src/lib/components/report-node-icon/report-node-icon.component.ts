import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { ArtefactService } from '../../services/artefact.service';
import { ReportNode } from '../../client/step-client-module';

@Component({
  selector: 'step-report-node-icon',
  templateUrl: './report-node-icon.component.html',
  styleUrls: ['./report-node-icon.component.scss'],
  host: {
    '[class.round-box]': 'roundBox()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportNodeIconComponent {
  private _artefactTypes = inject(ArtefactService);

  /** @Input() **/
  readonly node = input<ReportNode | undefined>();

  /** @Input() **/
  readonly highlightStatus = input(true);

  /** @Input() **/
  readonly roundBox = input(false);

  protected readonly icon = computed(() => {
    const node = this.node();
    if (!node) {
      return undefined;
    }
    return this._artefactTypes.getArtefactType(node.resolvedArtefact?._class)?.icon ?? this._artefactTypes.defaultIcon;
  });

  protected readonly artefactClass = computed(() => {
    const node = this.node();
    if (!node) {
      return '';
    }
    return node.resolvedArtefact?._class ?? '';
  });

  protected readonly statusClass = computed(() => {
    const node = this.node();
    const highlightStatus = this.highlightStatus();
    if (!node || !highlightStatus) {
      return undefined;
    }
    return `step-node-status-${node.status}`;
  });
}
