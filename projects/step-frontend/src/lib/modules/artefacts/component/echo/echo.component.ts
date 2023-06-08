import { Component } from '@angular/core';
import { AbstractArtefact, ArtefactContext, CustomComponent } from '@exense/step-core';

interface EchoArtefact extends AbstractArtefact {
  text: string;
}

@Component({
  selector: 'step-echo',
  templateUrl: './echo.component.html',
  styleUrls: ['./echo.component.scss'],
})
export class EchoComponent implements CustomComponent {
  context!: ArtefactContext<EchoArtefact>;
}
