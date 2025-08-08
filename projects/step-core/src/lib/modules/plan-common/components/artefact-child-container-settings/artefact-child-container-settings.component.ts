import { Component, input, model, output } from '@angular/core';
import { ChildrenBlock, DynamicValueBoolean } from '../../../../client/generated';
import { ArtefactNodeSource } from '../../types/artefact-node-source.enum';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-artefact-child-container-settings',
  templateUrl: './artefact-child-container-settings.component.html',
  styleUrl: './artefact-child-container-settings.component.scss',
  imports: [StepBasicsModule],
})
export class ArtefactChildContainerSettingsComponent {
  readonly name = input<string>();
  readonly childContainer = input.required<ChildrenBlock>();
  readonly isReadonly = input(false);
  readonly nodeType = input.required<ArtefactNodeSource>();

  readonly showAttributes = model(true);

  readonly save = output();

  protected handleContinueOnErrorChange(value: DynamicValueBoolean): void {
    this.childContainer().continueOnError = value;
    this.save.emit();
  }

  protected readonly ArtefactNodeSource = ArtefactNodeSource;
}
