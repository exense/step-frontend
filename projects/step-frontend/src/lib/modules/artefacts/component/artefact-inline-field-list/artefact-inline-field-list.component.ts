import { Component, input } from '@angular/core';
import { ArtefactInlineItem } from '@exense/step-core';

@Component({
  selector: 'step-artefact-inline-field-list',
  templateUrl: './artefact-inline-field-list.component.html',
  styleUrl: './artefact-inline-field-list.component.scss',
})
export class ArtefactInlineFieldListComponent {
  readonly isVertical = input(false);

  readonly items = input([], {
    transform: (value: ArtefactInlineItem[] | undefined) => value ?? [],
  });
}
