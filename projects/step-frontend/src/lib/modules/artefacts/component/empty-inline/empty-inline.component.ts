import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractArtefact, BaseInlineArtefactComponent } from '@exense/step-core';

@Component({
  selector: 'step-empty-inline',
  templateUrl: './empty-inline.component.html',
  styleUrl: './empty-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyInlineComponent extends BaseInlineArtefactComponent<AbstractArtefact> {}
