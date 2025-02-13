import { Component } from '@angular/core';
import { ArtefactInlineItem, BaseInlineArtefactComponent } from '@exense/step-core';
import { CaseArtefact } from '../../types/case.artefact';

@Component({
  selector: 'step-case-inline',
  templateUrl: './case-inline.component.html',
  styleUrl: './case-inline.component.scss',
})
export class CaseInlineComponent extends BaseInlineArtefactComponent<CaseArtefact> {
  protected getItems(
    artefact?: CaseArtefact,
    isVertical?: boolean,
    isResolved?: boolean,
  ): ArtefactInlineItem[] | undefined {
    if (!artefact) {
      return undefined;
    }
    return this.convert([['Value', artefact.value]], isResolved);
  }
}
