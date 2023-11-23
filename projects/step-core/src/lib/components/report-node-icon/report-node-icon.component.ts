import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ArtefactService } from '../../services/artefact.service';
import { ReportNode } from '../../client/step-client-module';

@Component({
  selector: 'step-report-node-icon',
  templateUrl: './report-node-icon.component.html',
  styleUrls: ['./report-node-icon.component.scss'],
})
export class ReportNodeIconComponent implements OnChanges {
  private _artefactTypes = inject(ArtefactService);

  protected statusClass?: string;
  protected icon?: string;

  @Input() node?: ReportNode;

  ngOnChanges(changes: SimpleChanges): void {
    const cNode = changes['node'];
    if (cNode?.previousValue !== cNode?.currentValue) {
      this.determineClassAndIcon(cNode?.currentValue);
    }
  }

  private determineClassAndIcon(node?: ReportNode): void {
    if (!node) {
      this.statusClass = undefined;
      this.icon = undefined;
      return;
    }

    const icon =
      this._artefactTypes.getArtefactType(node.resolvedArtefact?._class)?.icon ?? this._artefactTypes.defaultIcon;

    this.statusClass = `step-node-status-${node.status}`;
    this.icon = icon;
  }
}
