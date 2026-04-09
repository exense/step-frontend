import { Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { AltReportNodeDetailsDirective } from '../../directives/alt-report-node-details.directive';
import { ReportNode } from '@exense/step-core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'step-alt-report-node-header',
  templateUrl: './alt-report-node-header.component.html',
  styleUrl: './alt-report-node-header.component.scss',
  standalone: false,
  hostDirectives: [
    {
      directive: AltReportNodeDetailsDirective,
      inputs: ['node'],
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AltReportNodeHeaderComponent {
  private _reportNodeDetailsDirective = inject(AltReportNodeDetailsDirective);
  protected readonly _activatedRoute = inject(ActivatedRoute);
  protected readonly reportNode = computed(() => {
    const reportNode = this._reportNodeDetailsDirective.reportNode();
    return reportNode as ReportNode;
  });
}
