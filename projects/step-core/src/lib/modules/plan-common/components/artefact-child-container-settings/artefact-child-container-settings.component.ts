import { Component, input, model, output } from '@angular/core';
import { ChildrenBlock, DynamicValueBoolean } from '../../../../client/generated';
import { StepMaterialModule } from '../../../step-material/step-material.module';
import { StepIconsModule } from '../../../step-icons/step-icons.module';
import { DynamicFormsModule } from '../../../dynamic-forms/dynamic-forms.module';
import { FormsModule } from '@angular/forms';
import { ArtefactNodeSource } from '../../types/artefact-node-source.enum';

@Component({
  selector: 'step-artefact-child-container-settings',
  templateUrl: './artefact-child-container-settings.component.html',
  styleUrl: './artefact-child-container-settings.component.scss',
  imports: [StepMaterialModule, StepIconsModule, DynamicFormsModule, FormsModule],
  standalone: true,
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
