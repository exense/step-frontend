import { Component, input } from '@angular/core';
import { ArtefactInlineItem } from '@exense/step-core';

@Component({
  selector: 'step-artefact-inline-field',
  templateUrl: './artefact-inline-field.component.html',
  styleUrl: './artefact-inline-field.component.scss',
})
export class ArtefactInlineFieldComponent {
  readonly item = input.required<ArtefactInlineItem>();
}
