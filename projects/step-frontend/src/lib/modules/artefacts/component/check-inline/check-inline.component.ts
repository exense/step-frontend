import { Component } from '@angular/core';
import { ArtefactInlineItem, BaseInlineArtefactComponent } from '@exense/step-core';
import { CheckArtefact } from '../../types/check.artefact';

@Component({
  selector: 'step-check-inline',
  templateUrl: './check-inline.component.html',
  styleUrl: './check-inline.component.scss',
})
export class CheckInlineComponent extends BaseInlineArtefactComponent<CheckArtefact> {
  protected getItems(
    artefact?: CheckArtefact,
    isVertical?: boolean,
    isResolved?: boolean,
  ): ArtefactInlineItem[] | undefined {
    if (!artefact) {
      return undefined;
    }
    return this.convert([['Expression', artefact.expression]], isResolved);
  }
}
