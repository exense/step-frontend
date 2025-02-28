import { Component } from '@angular/core';
import { ArtefactInlineItem, BaseInlineArtefactComponent } from '@exense/step-core';
import { SleepArtefact } from '../../types/sleep.artefact';

@Component({
  selector: 'step-sleep-inline',
  templateUrl: './sleep-inline.component.html',
  styleUrl: './sleep-inline.component.scss',
})
export class SleepInlineComponent extends BaseInlineArtefactComponent<SleepArtefact> {
  protected getItems(
    sleep?: SleepArtefact,
    isVertical?: boolean,
    isResolved?: boolean,
  ): ArtefactInlineItem[] | undefined {
    if (!sleep) {
      return undefined;
    }
    return this.convert(
      [
        ['Duration', sleep?.duration],
        ['Unit', sleep?.unit],
      ],
      isResolved,
    );
  }
}
