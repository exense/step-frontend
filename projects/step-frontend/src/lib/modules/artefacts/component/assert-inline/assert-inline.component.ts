import { Component } from '@angular/core';
import { ArtefactInlineItem, BaseInlineArtefactComponent } from '@exense/step-core';
import { AssertArtefact } from '../../types/assert.artefact';

@Component({
  selector: 'step-assert-inline',
  templateUrl: './assert-inline.component.html',
  styleUrl: './assert-inline.component.scss',
})
export class AssertInlineComponent extends BaseInlineArtefactComponent<AssertArtefact> {
  protected getItems(
    assert?: AssertArtefact,
    isVertical?: boolean,
    isResolved?: boolean,
  ): ArtefactInlineItem[] | undefined {
    if (!assert) {
      return undefined;
    }
    return this.convert(
      [
        ['Actual', assert.actual],
        ['Operator', assert.operator],
        ['Expected', assert.expected],
        ['Negate', assert.doNegate],
        ['Custom Error', assert.customErrorMessage],
      ],
      isResolved,
    );
  }
}
