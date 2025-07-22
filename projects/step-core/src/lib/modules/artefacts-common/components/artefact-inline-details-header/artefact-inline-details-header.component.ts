import { Component, input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'step-artefact-inline-details-header',
  imports: [NgTemplateOutlet],
  templateUrl: './artefact-inline-details-header.component.html',
  styleUrl: './artefact-inline-details-header.component.scss',
})
export class ArtefactInlineDetailsHeaderComponent {
  readonly template = input<TemplateRef<unknown> | null | undefined>(undefined);
  readonly isVisible = input(true);
}
