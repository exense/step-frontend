import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ArtefactTypesService, Mutable, ReportNode } from '@exense/step-core';

type FieldAccessor = Mutable<Pick<ReportNodeIconComponent, 'statusClass' | 'icon'>>;

@Component({
  selector: 'step-report-node-icon',
  templateUrl: './report-node-icon.component.html',
  styleUrls: ['./report-node-icon.component.scss'],
})
export class ReportNodeIconComponent implements OnChanges {
  readonly statusClass?: string;
  readonly icon?: string;

  @Input() node?: ReportNode;

  constructor(private _artefactTypes: ArtefactTypesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const cNode = changes['node'];
    if (cNode?.previousValue !== cNode?.currentValue) {
      this.determineClassAndIcon(cNode?.currentValue);
    }
  }

  private determineClassAndIcon(node?: ReportNode): void {
    const fieldAccessor = this as FieldAccessor;

    if (!node) {
      fieldAccessor.statusClass = undefined;
      fieldAccessor.icon = undefined;
      return;
    }

    const icon = node.resolvedArtefact
      ? this._artefactTypes.getIconNg2(node.resolvedArtefact._class)
      : this._artefactTypes.getDefaultIconNg2();

    fieldAccessor.statusClass = `step-node-status-${node.status}`;
    fieldAccessor.icon = icon;
  }
}
